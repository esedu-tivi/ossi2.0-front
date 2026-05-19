import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Pencil } from "lucide-react";
import { GET_QUALIFICATION_UNIT_PART_BY_ID } from "../../graphql/GetQualificationUnitPartById";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const QualificationUnitPartDetails = () => {
  const navigate = useNavigate();
  const { partId } = useParams();

  // Fetch part details using GraphQL query
  const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PART_BY_ID, {
    variables: { partId: partId },
    fetchPolicy: "no-cache",
  });

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">Error: {error.message}</p>;

  const part = data?.part?.part;
  if (!part) {
    console.log("Data received from GraphQL query is empty or incorrect.");
    return <p className="p-4">Part not found</p>;
  }

  // Markdown rendering - content is sanitized with DOMPurify before rendering
  const md = new MarkdownIt({ html: true });
  const sanitizeHtml = (html: string) =>
    DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "b", "i", "strong", "a", "ul", "li", "ol", "img", "h1", "h2", "h3", "br", "div", "span", "iframe", "style"],
      ALLOWED_ATTR: ["src", "href", "alt", "target", "allowfullscreen", "allow", "style", "class", "frameborder"],
    });
  const safeDescription = sanitizeHtml(md.render(part.description || ""));
  const safeMaterials = sanitizeHtml(md.render(part.materials || ""));

  return (
    <div className="mx-auto max-w-5xl space-y-6 rounded-lg bg-muted/30 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-lg bg-primary px-6 py-4">
        <BackButton variant="ghost" className="mb-0 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" />
        <h2 className="text-xl font-semibold text-primary-foreground">
          {part.name}
        </h2>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Teeman nimi</h3>
            <div className="rounded-md border bg-white p-3">{part.name}</div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Teeman kuvaus</h3>
            {/* Content sanitized with DOMPurify */}
            <div className="prose max-w-none rounded-md border bg-white p-3" dangerouslySetInnerHTML={{ __html: safeDescription }} />
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Materiaalit</h3>
            {/* Content sanitized with DOMPurify */}
            <div className="prose max-w-none rounded-md border bg-white p-3" dangerouslySetInnerHTML={{ __html: safeMaterials }} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Tutkinnon osa</h3>
            {part.parentQualificationUnit ? (
              <Badge>{part.parentQualificationUnit.name}</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">Ei tutkinnon osaa</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Projektit</h3>
            <div className="flex flex-wrap gap-2">
              {part.projects && part.projects.length > 0 ? (
                part.projects.map((project: { id: string; name: string }) => (
                  <Badge key={project.id}>{project.name}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Ei projekteja lisättynä.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Button */}
      <div className="flex justify-end">
        <Button onClick={() => navigate(`/qualificationunitparts/edit/${part.id}`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Muokkaa
        </Button>
      </div>
    </div>
  );
};

export default QualificationUnitPartDetails;
