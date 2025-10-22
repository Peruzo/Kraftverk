"use client";

import React, { useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import products from "@/data/products.json";
import styles from "./page.module.css";

export default function ProductsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleProductPurchase = async (product: any) => {
    setLoading(product.id);
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          userId: "demo-user", // Replace with actual user ID later
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert(`Betalningsfel: ${data.error}`);
      }
    } catch (error) {
      alert("Nätverksfel - försök igen senare");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Kraftverk Produkter</h1>
            <p className={styles.heroSubtitle}>
              Upptäck vårt utbud av premium träningsprodukter med Kraftverk-märkning.
              <br />
              Kvalitet och design som matchar vår träningsfilosofi.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPurchase={handleProductPurchase}
                loading={loading === product.id}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Behöver du hjälp?</h2>
            <p className={styles.ctaText}>
              Kontakta oss om du har frågor om våra produkter eller behöver hjälp med din beställning.
            </p>
            <div className={styles.ctaButtons}>
              <a href="mailto:info@kraftverk.se" className={styles.contactButton}>
                Kontakta oss
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
