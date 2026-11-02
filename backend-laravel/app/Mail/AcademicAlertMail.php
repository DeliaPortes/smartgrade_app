<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AcademicAlertMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $alertTitle,
        public readonly string $alertBody,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->alertTitle);
    }

    public function content(): Content
    {
        return new Content(text: 'emails.academic-alert');
    }
}
