"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactSchema, type ContactFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WarmthSlider } from "@/components/WarmthSlider";
import { GroupSelector } from "@/components/GroupSelector";
import type { Contact, Group } from "@/types";

interface ContactFormProps {
  contact?: Contact;
  groups: Group[];
  onSubmit: (data: ContactFormValues) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  isLoading?: boolean;
}

export function ContactForm({
  contact,
  groups,
  onSubmit,
  onCancel,
  onDirtyChange,
  isLoading,
}: ContactFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      firstName: contact?.firstName ?? "",
      lastName: contact?.lastName ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      workTitle: contact?.workTitle ?? "",
      company: contact?.company ?? "",
      warmth: contact?.warmth ?? 5,
      notes: contact?.notes ?? "",
      lastInteraction: contact?.lastInteraction
        ? contact.lastInteraction.slice(0, 10)
        : "",
      birthday: contact?.birthday
        ? contact.birthday.slice(0, 10)
        : "",
      linkedinUrl: contact?.linkedinUrl ?? "",
      groupIds: contact?.groups.map((g) => g.id) ?? [],
    },
  });

  const warmth = watch("warmth");
  const groupIds = watch("groupIds");

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-xs text-[--destructive]">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-xs text-[--destructive]">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-[--destructive]">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" {...register("phone")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="workTitle">Title</Label>
          <Input id="workTitle" {...register("workTitle")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
        <Input id="linkedinUrl" type="url" {...register("linkedinUrl")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="lastInteraction">Last Interaction</Label>
          <Input id="lastInteraction" type="date" {...register("lastInteraction")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="birthday">Birthday</Label>
          <Input id="birthday" type="date" {...register("birthday")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <WarmthSlider
          value={warmth}
          onChange={(v) => setValue("warmth", v)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Groups</Label>
        <GroupSelector
          groups={groups}
          selectedIds={groupIds}
          onChange={(ids) => setValue("groupIds", ids)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Add any notes about this contact..."
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : contact ? "Save Changes" : "Add Contact"}
        </Button>
      </div>
    </form>
  );
}
