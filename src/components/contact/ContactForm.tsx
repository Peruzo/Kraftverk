"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { analytics } from "@/lib/analytics";
import styles from "./ContactForm.module.css";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    // Validate required fields
    if (!formData.email || !formData.message) {
      setSubmitStatus({
        type: "error",
        message: "E-post och meddelande är obligatoriska fält.",
      });
      setIsSubmitting(false);
      return;
    }

    // Prepare payload
    let messageContent = formData.message;
    if (formData.phone) {
      messageContent = `Telefon: ${formData.phone}\n\n${formData.message}`;
    }

    const payload = {
      tenant: "kraftverk",
      name: formData.name || undefined,
      email: formData.email,
      phone: formData.phone || undefined,
      subject: "Kontaktformulär",
      message: messageContent,
    };

    try {
      const response = await fetch(
        "https://source-database.onrender.com/api/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Track successful form submission
        analytics.sendCustomEvent("form_submit", {
          formType: "contact_form",
          success: true,
          messageId: result.id,
        });

        setSubmitStatus({
          type: "success",
          message:
            "Tack för ditt meddelande! Vi återkommer så snart som möjligt.",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        // Track failed form submission
        analytics.sendCustomEvent("form_submit", {
          formType: "contact_form",
          success: false,
          error: result.message || "Unknown error",
        });
        setSubmitStatus({
          type: "error",
          message:
            result.message ||
            "Något gick fel. Vänligen försök igen senare.",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Track network error
      analytics.sendCustomEvent("form_submit", {
        formType: "contact_form",
        success: false,
        error: "Network error",
      });

      setSubmitStatus({
        type: "error",
        message:
          "Kunde inte skicka meddelandet. Vänligen försök igen senare.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding="lg" className={styles.formCard}>
      <h3 className={styles.formTitle}>Kontakta oss</h3>
      <p className={styles.formSubtitle}>
        Har du frågor eller funderingar? Skicka oss ett meddelande så återkommer vi så snart som möjligt.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Honeypot field (hidden) */}
        <input
          type="text"
          name="company"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />

        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Namn
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ditt namn"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            E-post <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="din.epost@example.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            Telefonnummer
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
            placeholder="+46 70 123 45 67"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>
            Meddelande <span className={styles.required}>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className={styles.textarea}
            placeholder="Skriv ditt meddelande här..."
            maxLength={5000}
          />
          <div className={styles.charCount}>
            {formData.message.length} / 5000 tecken
          </div>
        </div>

        {submitStatus.type && (
          <div
            className={`${styles.statusMessage} ${
              submitStatus.type === "success"
                ? styles.statusSuccess
                : styles.statusError
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? "Skickar..." : "Skicka meddelande"}
        </Button>
      </form>
    </Card>
  );
}

