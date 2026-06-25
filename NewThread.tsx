import { useLocation } from "wouter";
import { useCreateThread, useListCategories } from "@workspace/api-client-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, EyeOff, Info } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  categoryId: z.coerce.number({ required_error: "Please select a category" }),
  body: z.string().min(10, "Please share a bit more detail (minimum 10 characters)"),
  authorName: z.string().optional(),
  isAnonymous: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

export function NewThread() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const createThread = useCreateThread();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
      authorName: "",
      isAnonymous: false,
    },
  });

  const isAnon = form.watch("isAnonymous");

  function onSubmit(data: FormValues) {
    createThread.mutate({
      data: {
        title: data.title,
        body: data.body,
        categoryId: data.categoryId,
        authorName: data.authorName || "Anonymous",
        isAnonymous: data.isAnonymous
      }
    }, {
      onSuccess: (newThread) => {
        toast({
          title: "Success!",
          description: "Your discussion has been posted.",
        });
        setLocation(`/forum/${newThread.id}`);
      },
      onError: () => {
        toast({
          title: "Something went wrong",
          description: "Could not post your discussion. Please try again.",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl pb-24">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Start a Conversation</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          This is a safe, judgment-free space. Share what's on your mind.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="border-border shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Discussion Details</CardTitle>
                  <CardDescription>
                    What would you like to talk about today?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Title</FormLabel>
                        <FormControl>
                          <Input placeholder="A brief summary of your topic..." className="text-lg py-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          disabled={categoriesLoading} 
                          onValueChange={field.onChange} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Where does this belong?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                  {cat.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Story</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your thoughts, ask for advice, or just vent. We're listening." 
                            className="min-h-[200px] resize-y text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 border-t border-border space-y-6">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" /> Privacy & Identity
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="isAnonymous"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              Post Anonymously <EyeOff className="h-4 w-4 text-muted-foreground" />
                            </FormLabel>
                            <FormDescription>
                              Hide your identity completely. Stigma has no place here.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!isAnon && (
                      <FormField
                        control={form.control}
                        name="authorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="How should we call you?" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave blank to show as "Anonymous"
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t px-6 py-4">
                  <div className="flex w-full justify-between items-center">
                    <Button type="button" variant="ghost" onClick={() => setLocation("/forum")}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="font-bold min-w-[150px]"
                      disabled={createThread.isPending}
                    >
                      {createThread.isPending ? "Posting..." : "Publish Post"}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Info className="h-5 w-5" /> Safe Space Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Be compassionate.</strong> Everyone here is fighting a hard battle. Treat them with the kindness you deserve.
              </p>
              <p>
                <strong className="text-foreground">No judgment.</strong> Addiction and mental illness do not discriminate. Neither do we.
              </p>
              <p>
                <strong className="text-foreground">Stay safe.</strong> Please do not share personal contact information, locations, or sensitive identifying data.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">In Crisis?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-foreground">
                If you are thinking about harming yourself or others, please get help immediately.
              </p>
              <p className="font-bold text-destructive text-lg pt-2">
                Call or Text 988
              </p>
              <p className="text-muted-foreground">
                Suicide & Crisis Lifeline - Available 24/7, free, and confidential.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
