'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { contactSchema, type ContactInput } from '@/lib/schemas'

type Status = { kind: 'idle' } | { kind: 'sent' } | { kind: 'error'; message: string }

const FIELD_CLASS =
  'h-11 w-full rounded border border-border-interactive bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground'

const GENERIC_ERROR = 'Could not send message. Please email directly.'

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setStatus({ kind: 'idle' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.status === 400) {
        const body: { errors?: Record<string, string> } = await res.json()
        for (const [field, message] of Object.entries(body.errors ?? {})) {
          setError(field as keyof ContactInput, { message })
        }
        return
      }

      if (!res.ok) {
        const body: { error?: string } = await res.json().catch(() => ({}))
        setStatus({ kind: 'error', message: body.error ?? GENERIC_ERROR })
        return
      }

      reset()
      setStatus({ kind: 'sent' })
    } catch {
      setStatus({ kind: 'error', message: GENERIC_ERROR })
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className="font-mono text-xs text-muted-foreground">
          Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className={`mt-2 ${FIELD_CLASS}`}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="name-error" className="mt-2 text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="font-mono text-xs text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={`mt-2 ${FIELD_CLASS}`}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="mt-2 text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="font-mono text-xs text-muted-foreground">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          className="mt-2 w-full rounded border border-border-interactive bg-background px-3 py-2 text-sm text-foreground"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'message-error' : undefined}
          {...register('message')}
        />
        {errors.message && (
          <p id="message-error" className="mt-2 text-sm text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      {/*
        Honeypot. Positioned off-screen rather than display:none, because some
        bots skip fields they can tell are hidden. Real users never reach it —
        it is out of the tab order and hidden from assistive technology.
      */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded bg-accent px-5 text-sm font-medium text-background transition-colors duration-200 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          {isSubmitting ? 'Sending…' : 'Send message'}
        </button>
      </div>

      {status.kind === 'sent' && (
        <p role="status" aria-live="polite" className="text-sm text-accent">
          Message sent. I&apos;ll reply to the address you gave.
        </p>
      )}
      {status.kind === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          {status.message}
        </p>
      )}
    </form>
  )
}
