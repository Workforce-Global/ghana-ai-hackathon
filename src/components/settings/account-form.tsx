"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateEmail, updatePassword } from 'firebase/auth';
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const emailFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

const passwordFormSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function AccountForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    if (!user) return;
    setIsEmailLoading(true);
    try {
      await updateEmail(user, values.email);
      toast({ title: "Email Updated", description: "Your email has been successfully updated." });
      // Note: Firebase might require re-authentication for this action.
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    } finally {
      setIsEmailLoading(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    if (!user) return;
    setIsPasswordLoading(true);
    try {
      await updatePassword(user, values.password);
      toast({ title: "Password Updated", description: "Your password has been successfully updated." });
      passwordForm.reset();
       // Note: Firebase might require re-authentication for this action.
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    } finally {
      setIsPasswordLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Update your email address and password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Update Email Form */}
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.new@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isEmailLoading}>
              {isEmailLoading ? 'Updating...' : 'Update Email'}
            </Button>
          </form>
        </Form>
        
        <Separator />

        {/* Update Password Form */}
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPasswordLoading}>
             {isPasswordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
