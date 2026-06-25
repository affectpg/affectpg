import { useState, useMemo } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useListCategories, useListThreads, getListThreadsQueryKey } from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageSquare, Clock, Plus, Frown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function Forum() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const queryParams = useMemo(() => ({
    search: debouncedSearch || null,
    categoryId: selectedCategory,
    limit: 50
  }), [debouncedSearch, selectedCategory]);

  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  
  const { data: threads, isLoading: threadsLoading } = useListThreads(queryParams, {
    query: {
      queryKey: getListThreadsQueryKey(queryParams)
    }
  });

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="bg-muted border-b border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Forum</h1>
            <p className="text-muted-foreground mt-1">Join the conversation. Share your story. Find support.</p>
          </div>
          <Link href="/new-thread">
            <Button className="gap-2 font-bold shadow-sm">
              <Plus className="h-4 w-4" />
              New Thread
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search discussions..." 
                className="pl-9 bg-card"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === null 
                    ? "bg-secondary text-secondary-foreground" 
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <span>All Topics</span>
              </button>
              
              {categoriesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))
              ) : categories?.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat.id 
                      ? "bg-secondary text-secondary-foreground" 
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-background/50">
                    {cat.threadCount}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 space-y-4">
          {threadsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-xl bg-card">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))
          ) : threads && threads.length > 0 ? (
            threads.map(thread => (
              <Link key={thread.id} href={`/forum/${thread.id}`}>
                <div className="p-5 border rounded-xl bg-card hover:border-primary/50 transition-colors cursor-pointer group hover-elevate">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant="outline" 
                      className="text-xs font-semibold border-transparent text-white"
                      style={{ backgroundColor: thread.categoryColor }}
                    >
                      {thread.categoryName}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {thread.title}
                  </h2>
                  
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {thread.body}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold uppercase">
                        {(thread.isAnonymous ? "A" : thread.authorName[0]) || "U"}
                      </div>
                      <span className="font-medium text-foreground">
                        {thread.isAnonymous ? "Anonymous" : thread.authorName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 font-medium">
                      <MessageSquare className="h-4 w-4" />
                      {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 border border-dashed rounded-xl bg-muted/20">
              <Frown className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No threads found</h3>
              <p className="text-muted-foreground mb-6">There are no discussions matching your criteria.</p>
              <Link href="/new-thread">
                <Button>Start the first one</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
