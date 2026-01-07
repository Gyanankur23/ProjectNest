import { useState } from "react";
import { useArticles } from "@/hooks/use-articles";
import { ArticleCard } from "@/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

const CATEGORIES = ["All", "Agile", "Risk Management", "Leadership", "Productivity", "Strategy"];

export default function Articles() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { data: articles, isLoading } = useArticles({ 
    category: selectedCategory === "All" ? undefined : selectedCategory,
    search: search || undefined
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-display mb-4">Knowledge Base</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
            Explore our library of articles, guides, and resources tailored for project managers.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap ${selectedCategory === cat ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : articles?.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles?.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
