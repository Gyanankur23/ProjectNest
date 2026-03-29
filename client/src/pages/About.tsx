import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-20 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">About ProjectNest</h1>
          <p className="text-xl text-muted-foreground">
            We are building the future of project management education, combining human expertise with AI intelligence.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16">
        <section>
          <h2 className="text-3xl font-bold font-display mb-6">Our Mission</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            ProjectNest started with a simple idea: Project Management shouldn't be about just following processes, but about delivering value. We realized that many PMs struggle to find high-quality, actionable templates and insights.
            <br/><br/>
            Our mission is to democratize access to elite project management knowledge. By leveraging Generative AI and curating expert content, we provide resources that would typically cost thousands in consultancy fees, at a fraction of the price.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold font-display mb-8">The Team</h2>
          <div className="flex justify-center">
            <Card className="hover:shadow-lg transition-all duration-300 w-full max-w-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-4 text-3xl">🚀</div>
                <h3 className="text-xl font-bold mb-1">Gyanankur Baruah</h3>
                <p className="text-sm text-primary mb-3">Founder & Author</p>
                <p className="text-sm text-muted-foreground">
                  Expert in Project Management. Building the future of PM education and tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
