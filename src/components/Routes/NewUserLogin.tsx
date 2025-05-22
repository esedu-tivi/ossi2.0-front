// TODO use correct QUALIFICATION_ID to select all TVP for new users. Backend does not support this yet.

import React, { useState, useEffect } from 'react';
import buttonStyles from '../../styles/buttonStyles';
import formStyles from '../../styles/formStyles';

import { useAuth } from '../../utils/auth-context';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { SET_STUDENT_INFO } from '../../graphql/SetStudentInfo';
import { USER_SETUP } from '../../graphql/UserSetup';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';

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
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Typography variant="h5">Haetaan käyttäjän tietoja...</Typography>
                </Box>
            </motion.div>
        );
    }

    if (meError) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">Virhe käyttäjätietojen haussa</Typography>
            </Box>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    padding: 3,
                    borderRadius: 2,
                    boxShadow: 3,
                    backgroundColor: 'white',
                }}
            >
                <Box sx={{ ...formStyles.formOuterBox }}>
                    <Box sx={{ ...formStyles.formBannerBox, textAlign: "center", marginBottom: 3 }}>
                        <Typography variant="h4" align="center" color="white">
                            Uuden käyttäjän luonti
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 6,
                            borderRadius: 4,
                            minWidth: 600,
                            backgroundColor: '#ffffff',
                            textAlign: 'center',
                        }}
                    >
                        {studentType === null ? (
                            <>
                                <Typography variant="h4" sx={{ mb: 2 }}>
                                    Tervetuloa käyttämään Ossia!
                                </Typography>
                                <Typography variant="h4" sx={{ mb: 8 }}>
                                    Aluksi valitse oletko:
                                </Typography>

                                <Box display="flex" gap={4} sx={{ mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleSelection('FULL_COMPLETION')}
                                        disabled={isSubmitting}
                                        sx={{ ...buttonStyles.cancelButton, minWidth: '400px' }}
                                    >
                                        Täyden tutkinnon suorittaja (180 Osp)
                                    </Button>

                                    <Typography variant="h4" textAlign="center">:</Typography>

                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleSelection('PARTIAL_COMPLETION')}
                                        disabled={isSubmitting}
                                        sx={{ ...buttonStyles.cancelButton, minWidth: '400px' }}
                                    >
                                        Osatutkinnon suorittaja
                                    </Button>
                                </Box>
                                <Typography variant="h5" sx={{ mt: 2, mb: 4 }}>
                                    Valinnan jälkeen sinut ohjataan uudelleen kirjautumissivulle
                                </Typography>
                            </>
                        ) : (
                            <Typography sx={{ mt: 4 }}>
                                Tallennetaan tietoja... Hetkinen...
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
};

export default NewUserLogin;
