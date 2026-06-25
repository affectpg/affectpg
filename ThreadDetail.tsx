import { useState, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useGetThread, useListReplies, useCreateReply, getGetThreadQueryKey, getListRepliesQueryKey, useDeleteThread } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Clock, Trash2, MessageCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ThreadDetail() {
  const params = useParams();
  const threadId = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [replyBody, setReplyBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: thread, isLoading: threadLoading, isError: threadError } = useGetThread(threadId, {
    query: {
      enabled: !!threadId,
      queryKey: getGetThreadQueryKey(threadId)
    }
  });

  const { data: replies, isLoading: repliesLoading } = useListReplies(threadId, {
    query: {
      enabled: !!threadId,
      queryKey: getListRepliesQueryKey(threadId)
    }
  });

  const createReply = useCreateReply();
  const deleteThread = useDeleteThread();

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    createReply.mutate({
      id: threadId,
      data: {
        body: replyBody,
        authorName: authorName || "Anonymous",
        isAnonymous
      }
    }, {
      onSuccess: () => {
        setReplyBody("");
        queryClient.invalidateQueries({ queryKey: getListRepliesQueryKey(threadId) });
        queryClient.invalidateQueries({ queryKey: getGetThreadQueryKey(threadId) });
        toast({
          title: "Reply posted",
          description: "Your message has been added to the discussion.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not post your reply. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleDeleteThread = () => {
    deleteThread.mutate({ id: threadId }, {
      onSuccess: () => {
        toast({
          title: "Thread deleted",
          description: "The discussion has been removed.",
        });
        setLocation("/forum");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not delete thread. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (threadError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Thread not found</h2>
        <p className="text-muted-foreground mb-6">This discussion may have been deleted or doesn't exist.</p>
        <Link href="/forum">
          <Button>Back to Forum</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pb-24">
      <Link href="/forum" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to all discussions
      </Link>

      {/* Main Post */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm mb-8">
        {threadLoading ? (
          <div className="p-6 md:p-8">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-6" />
            <Skeleton className="h-24 w-full mb-6" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        ) : thread ? (
          <>
            <div className="p-6 md:p-8 border-b">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <Badge 
                  className="text-xs font-semibold text-white border-transparent"
                  style={{ backgroundColor: thread.categoryColor }}
                >
                  {thread.categoryName}
                </Badge>
                
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                  </span>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this discussion?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the thread and all of its replies.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteThread} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete Thread
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-foreground leading-tight">
                {thread.title}
              </h1>

              <div className="flex items-center gap-3 mb-8 bg-muted/30 p-3 rounded-lg w-max">
                <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-lg">
                  {(thread.isAnonymous ? "A" : thread.authorName[0]) || "U"}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {thread.isAnonymous ? "Anonymous" : thread.authorName}
                  </div>
                  <div className="text-xs text-muted-foreground">Original Poster</div>
                </div>
              </div>

              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {thread.body.split('\n').map((paragraph, i) => (
                  paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Replies Section */}
      <div className="mb-12">
        <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {replies?.length || 0} Replies
        </h3>

        <div className="space-y-4">
          {repliesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 border rounded-xl bg-card">
                <div className="flex gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))
          ) : replies && replies.length > 0 ? (
            replies.map(reply => (
              <div key={reply.id} className="p-6 border rounded-xl bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                      {(reply.isAnonymous ? "A" : reply.authorName[0]) || "U"}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {reply.isAnonymous ? "Anonymous" : reply.authorName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-foreground whitespace-pre-wrap">
                  {reply.body}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-muted/20 border border-dashed rounded-xl">
              <p className="text-muted-foreground">No replies yet. Be the first to share your thoughts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Form */}
      <div className="bg-muted/50 p-6 md:p-8 rounded-xl border">
        <h3 className="text-lg font-bold mb-4">Leave a Reply</h3>
        <form onSubmit={handleSubmitReply} className="space-y-4">
          <div className="space-y-2">
            <Textarea 
              placeholder="What are your thoughts? Remember to be kind and supportive."
              className="min-h-[120px] bg-background"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="authorName">Display Name (Optional)</Label>
              <Input 
                id="authorName" 
                placeholder="How should we call you?" 
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                disabled={isAnonymous}
                className="bg-background"
              />
            </div>
            
            <div className="flex items-center space-x-2 border rounded-md p-3 bg-background h-10">
              <Switch 
                id="anonymous" 
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous" className="cursor-pointer flex-1">Post Anonymously</Label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              size="lg"
              disabled={createReply.isPending || !replyBody.trim()}
              className="w-full md:w-auto font-bold"
            >
              {createReply.isPending ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
