import { useRoute } from "wouter";
import { useArticle, useDownloadPdf } from "@/hooks/use-articles";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { Download, Lock, Calendar, Tag, ChevronLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ArticleDetail() {
  const [, params] = useRoute("/articles/:id");
  const id = parseInt(params?.id || "0");
  const { data: article, isLoading } = useArticle(id);
  const { user } = useUser();
  const downloadPdf = useDownloadPdf();
  const { toast } = useToast();

  const handleDownload = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to download premium content.",
        variant: "destructive",
      });
      return;
    }

    downloadPdf.mutate(id, {
      onSuccess: (data) => {
        window.open(data.url, '_blank');
        toast({
          title: "Download Started",
          description: "Your PDF is ready.",
        });
      },
      onError: (error) => {
        toast({
          title: "Access Denied",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) return <ArticleSkeleton />;
  if (!article) return <div className="text-center py-20">Article not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Banner */}
      <div className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/articles">
            <Button variant="ghost" size="sm" className="mb-6 -ml-4 text-muted-foreground">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Articles
            </Button>
          </Link>
          
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="bg-background">{article.category}</Badge>
            {article.isPremium && <Badge className="bg-amber-500 hover:bg-amber-600">Premium</Badge>}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold font-display leading-tight mb-6">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(article.createdAt || new Date()), 'MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {article.generatedByAi ? "AI Generated" : "Editor's Choice"}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-12 grid grid-cols-1 md:grid-cols-[1fr_250px] gap-12">
        <article className="prose prose-lg dark:prose-invert prose-orange max-w-none">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </article>
        
        <aside className="space-y-6">
          <div className="sticky top-24">
            <div className="p-6 rounded-2xl bg-card border shadow-sm">
              <h3 className="font-bold mb-4 font-display text-lg">Article Resources</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Get the PDF version of this article for your personal library.
              </p>
              
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                onClick={handleDownload}
                disabled={downloadPdf.isPending}
              >
                {downloadPdf.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : article.isPremium && user?.subscriptionStatus === 'free' ? (
                  <Lock className="w-4 h-4 mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {downloadPdf.isPending ? "Generating..." : "Download PDF"}
              </Button>
              
              {article.isPremium && user?.subscriptionStatus === 'free' && (
                <p className="text-xs text-center mt-3 text-muted-foreground">
                  <Link href="/pricing" className="text-orange-500 hover:underline">
                    Upgrade to Premium
                  </Link> to unlock
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
