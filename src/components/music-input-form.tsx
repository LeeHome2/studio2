'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateKeychainAction, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WandSparkles } from 'lucide-react';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      size="lg" 
      className="w-full font-bold text-base bg-accent text-accent-foreground hover:bg-accent/90"
      disabled={pending}
    >
      <WandSparkles className={cn("mr-2 h-5 w-5", pending && "animate-spin")} />
      {pending ? 'Generating...' : 'Create Keychain'}
    </Button>
  );
}

export function MusicInputForm({ onStateChange }: { onStateChange: (state: FormState, pending: boolean) => void }) {
  const [state, formAction] = useActionState(generateKeychainAction, {});
  const { pending } = useFormStatus();
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    onStateChange(state, pending);
  }, [state, pending, onStateChange]);

  useEffect(() => {
    if(!pending && (state.prompt || state.error)) {
        // Reset form only after submission is complete (success or error)
        // and if there's a prompt or an error to display.
        // This prevents resetting during the 'Generating 3d model' phase.
        if (state.prompt) {
            formRef.current?.reset();
        }
    }
  }, [state.prompt, state.error, pending]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="grid w-full gap-2">
        <Label htmlFor="musicInfo" className="text-base font-semibold">Your Music</Label>
        <Textarea
          id="musicInfo"
          name="musicInfo"
          placeholder="e.g., 'Bohemian Rhapsody by Queen', lyrics from your favorite song, or a Spotify/YouTube link..."
          className="min-h-[150px] text-base"
          required
          aria-describedby="musicInfo-error"
        />
        {state.error && !pending && <p id="musicInfo-error" className="text-sm text-destructive">{state.error}</p>}
      </div>
      <SubmitButton />
    </form>
  );
}
