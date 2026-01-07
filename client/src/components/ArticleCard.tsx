import { Link } from "wouter";
import { type Article } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Lock, Zap } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group">
        <div className="h-48 overflow-hidden bg-muted relative">
          {/* Fallback pattern or image */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-950/30 dark:to-amber-900/10 flex items-center justify-center">
             <Zap className="w-12 h-12 text-orange-200 dark:text-orange-900" />
          </div>
          {/* Badge Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background">
              {article.category}
            </Badge>
            {article.isPremium && (
              <Badge className="bg-amber-500 text-white gap-1 shadow-sm">
                <Lock className="w-3 h-3" /> Premium
              </Badge>
            )}
            {article.generatedByAi && (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm gap-1 border-purple-200 text-purple-700 dark:text-purple-300">
                <Zap className="w-3 h-3" /> AI Generated
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="pb-3">
          <h3 className="text-xl font-bold font-display line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {article.content.replace(/[#*`]/g, '').slice(0, 150)}...
          </p>
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between border-t bg-muted/20 p-4">
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(article.createdAt || new Date()), 'MMM d, yyyy')}
          </div>
          <Link href={`/articles/${article.id}`}>
            <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-orange-50 dark:hover:bg-orange-950/30">
              Read Article →
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
