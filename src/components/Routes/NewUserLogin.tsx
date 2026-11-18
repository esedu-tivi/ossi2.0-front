// TODO use correct QUALIFICATION_ID to select all TVP for new users. Backend does not support this yet.

import React, { useState, useEffect } from 'react';

import { useAuth } from '@/utils/auth-context';
import { useNavigate } from 'react-router-dom';
import { SET_STUDENT_INFO } from '@/graphql/SetStudentInfo';
import { USER_SETUP } from '@/graphql/UserSetup';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QUALIFICATION_ID = '7861752'; // Temp TVP id

const NewUserLogin: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [studentType, setStudentType] = useState<'FULL_COMPLETION' | 'PARTIAL_COMPLETION' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: meData, loading: meLoading, error: meError, stopPolling } = useQuery(USER_SETUP, {
        skip: !isAuthenticated,
        fetchPolicy: 'network-only',
        pollInterval: 500,
        onError: (err) => {
            console.warn('User setup query failed:', err.message);
        }
    });

    // Stop polling once we have data
    useEffect(() => {
        if (meData?.me) {
            stopPolling();
        }
    }, [meData, stopPolling]);

    // Navigate if user is already set up
    useEffect(() => {
        if (meData?.amISetUp?.amISetUp) {
            navigate('/studentdashboard');
        }
    }, [meData, navigate]);

    const [setStudentInfo] = useMutation(SET_STUDENT_INFO, {
        update(cache, { data }) {
            if (data?.me) {
                cache.writeQuery({
                    query: USER_SETUP,
                    data: {
                        me: data.me,
                        amISetUp: true
                    },
                });
            }
        }
    });

    const handleSelection = async (type: 'FULL_COMPLETION' | 'PARTIAL_COMPLETION') => {
        setIsSubmitting(true);
        setStudentType(type);

        try {
            const studentId = meData?.me?.user?.id;
            if (!studentId) {
                throw new Error('Student ID not found');
            }

            await setStudentInfo({
                variables: {
                    studentId,
                    studentSetupInput: {
                        qualificationCompletion: type,
                        qualificationId: QUALIFICATION_ID
                    }
                },
            });

            await new Promise(resolve => setTimeout(resolve, 300));
            navigate('/');
        } catch (err) {
            console.error('Error setting up student:', err);
            setIsSubmitting(false);
        }
    };

    // Wait until amISetUp is defined before rendering
    if (!isAuthenticated || meLoading || !meData || typeof meData.amISetUp?.amISetUp === 'undefined') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex h-screen items-center justify-center">
                    <h2 className="text-xl font-semibold">Haetaan k&auml;ytt&auml;j&auml;n tietoja...</h2>
                </div>
            </motion.div>
        );
    }

    if (meError) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-destructive">Virhe k&auml;ytt&auml;j&auml;tietojen haussa</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex min-h-screen items-center justify-center p-6">
                <Card className="w-full max-w-3xl">
                    <CardHeader className="bg-primary rounded-t-xl px-6 py-4">
                        <CardTitle className="text-center text-xl text-primary-foreground">
                            Uuden k&auml;ytt&auml;j&auml;n luonti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 text-center">
                        {studentType === null ? (
                            <>
                                <h2 className="mb-2 text-2xl font-semibold">
                                    Tervetuloa k&auml;ytt&auml;m&auml;&auml;n Ossia!
                                </h2>
                                <h3 className="mb-10 text-2xl font-semibold">
                                    Aluksi valitse oletko:
                                </h3>

                                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                                    <Button
                                        size="lg"
                                        onClick={() => handleSelection('FULL_COMPLETION')}
                                        disabled={isSubmitting}
                                        className="min-w-[280px]"
                                    >
                                        T&auml;yden tutkinnon suorittaja (180 Osp)
                                    </Button>

                                    <span className="text-2xl font-semibold">:</span>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => handleSelection('PARTIAL_COMPLETION')}
                                        disabled={isSubmitting}
                                        className="min-w-[280px]"
                                    >
                                        Osatutkinnon suorittaja
                                    </Button>
                                </div>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    Valinnan j&auml;lkeen sinut ohjataan uudelleen kirjautumissivulle
                                </p>
                            </>
                        ) : (
                            <p className="mt-4 text-muted-foreground">
                                Tallennetaan tietoja... Hetkinen...
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};

export default NewUserLogin;
