import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useGetStats, useGetRecentThreads } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, MessagesSquare, ArrowRight, Heart } from "lucide-react";

export function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: recentThreads, isLoading: recentLoading } = useGetRecentThreads();

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Hero Section */}
      <section className="relative w-full bg-secondary text-secondary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)]"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 flex flex-col items-center text-center">
          <img 
            src="/apg-logo.png" 
            alt="Affect Philanthropy Group" 
            className="w-32 h-32 md:w-48 md:h-48 mb-8 drop-shadow-xl filter invert" 
          />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl">
            A Safe House for candid, judgment-free connection.
          </h1>
          <p className="text-lg md:text-xl text-secondary-foreground/80 max-w-2xl mb-10 leading-relaxed">
            Companionship and harmony are the foundation of healing. We are a community fighting addiction and mental illness together. Speak freely, find acceptance, and help each other through the process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/new-thread">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
                Share Your Story
              </Button>
            </Link>
            <Link href="/forum">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-secondary-foreground/20 hover:bg-secondary-foreground/10">
                Read the Forum
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-card border-none shadow-sm rounded-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <CardHeader className="pb-2">
                <CardDescription className="font-semibold tracking-wider uppercase text-xs">Total Threads</CardDescription>
                <CardTitle className="text-4xl font-serif">
                  {statsLoading ? <Skeleton className="h-10 w-24" /> : stats?.totalThreads || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 absolute bottom-4 right-4" />
              </CardContent>
            </Card>
            
            <Card className="bg-card border-none shadow-sm rounded-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/80"></div>
              <CardHeader className="pb-2">
                <CardDescription className="font-semibold tracking-wider uppercase text-xs">Replies</CardDescription>
                <CardTitle className="text-4xl font-serif">
                  {statsLoading ? <Skeleton className="h-10 w-24" /> : stats?.totalReplies || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MessagesSquare className="h-8 w-8 text-muted-foreground/30 absolute bottom-4 right-4" />
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-sm rounded-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/60"></div>
              <CardHeader className="pb-2">
                <CardDescription className="font-semibold tracking-wider uppercase text-xs">Categories</CardDescription>
                <CardTitle className="text-4xl font-serif">
                  {statsLoading ? <Skeleton className="h-10 w-24" /> : stats?.totalCategories || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Users className="h-8 w-8 text-muted-foreground/30 absolute bottom-4 right-4" />
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground border-none shadow-sm rounded-xl overflow-hidden relative flex flex-col justify-center items-start p-6">
              <h3 className="font-serif font-bold text-xl mb-2">You are not alone.</h3>
              <p className="text-sm text-primary-foreground/80 mb-4">Join {statsLoading ? "..." : stats?.recentActivity || 0} people active today.</p>
              <Heart className="h-12 w-12 text-primary-foreground/20 absolute bottom-[-10px] right-[-10px]" />
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2">Recent Discussions</h2>
            <p className="text-muted-foreground">What the community is talking about right now.</p>
          </div>
          <Link href="/forum">
            <Button variant="ghost" className="hidden sm:flex group">
              View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader className="gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent className="mt-auto">
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : recentThreads && recentThreads.length > 0 ? (
            recentThreads.map((thread) => (
              <Link key={thread.id} href={`/forum/${thread.id}`}>
                <Card className="flex flex-col h-full hover:border-primary/50 transition-colors cursor-pointer group hover-elevate">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: thread.categoryColor }}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {thread.categoryName}
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                      {thread.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0 text-sm text-muted-foreground flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {thread.isAnonymous ? "Anonymous" : thread.authorName}
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      {thread.replyCount}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl border border-dashed">
              <p className="text-muted-foreground">No recent discussions found.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 sm:hidden">
          <Link href="/forum">
            <Button variant="outline" className="w-full">
              View All Discussions
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
