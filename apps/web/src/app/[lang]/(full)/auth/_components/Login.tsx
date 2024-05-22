import { Button } from "@/components/ui/button";

export function Login() {
  return (
    <div className="flex w-[330px] flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">
          Use your trust model to login.
        </p>
      </div>
      <form className="grid gap-4">
        <Button variant="default" size="sm" className="w-full">
          Choose Key
        </Button>
      </form>
    </div>
  );
}
