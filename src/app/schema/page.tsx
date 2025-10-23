"use client";

import React, { useState, useMemo } from "react";
import ClassCard from "@/components/booking/ClassCard";
import FilterChips from "@/components/booking/FilterChips";
import classTemplates from "@/data/classes.json";
import trainers from "@/data/trainers.json";
import type { ClassInstance } from "@/types";
import styles from "./page.module.css";

export default function SchemaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<string | null>(null);
  const [selectedStudio, setSelectedStudio] = useState<string>("stockholm-city");
  const [loading, setLoading] = useState<string | null>(null);

  // Generate mock class instances for today/tomorrow
  const classInstances: ClassInstance[] = useMemo(() => {
    const instances: ClassInstance[] = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const times = ["07:00", "10:00", "12:00", "18:00", "19:30"];

    classTemplates.forEach((template, idx) => {
      times.forEach((time, timeIdx) => {
        const [hours, minutes] = time.split(":").map(Number);
        const classDate = timeIdx < 3 ? new Date(today) : new Date(today);
        classDate.setHours(hours, minutes, 0, 0);

        const trainer = trainers[idx % trainers.length];

        instances.push({
          id: `${template.id}-${time}-${timeIdx}`,
          templateId: template.id,
          template,
          studioId: "stockholm-city",
          trainerId: trainer.id,
          trainer,
          startTime: classDate.toISOString(),
          spots: 20,
          bookedSpots: Math.floor(Math.random() * 22), // Random booking status
        });
      });
    });

    return instances.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, []);

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classInstances.filter((instance) => {
      if (selectedCategory && instance.template?.category !== selectedCategory) {
        return false;
      }
      if (selectedIntensity && instance.template?.intensity !== selectedIntensity) {
        return false;
      }
      return true;
    });
  }, [classInstances, selectedCategory, selectedIntensity]);

  const categories = Array.from(new Set(classTemplates.map((c) => c.category)));
  const intensities = ["Låg", "Medel", "Hög"];
  const studios = [
    { id: "stockholm-city", name: "Stockholm City" },
    { id: "stockholm-sodermalm", name: "Södermalm" },
  ];

  const handleBookClass = async (classInstance: ClassInstance) => {
    setLoading(classInstance.id);
    
    try {
      // Get customer data from auth store or prompt for email
      const customerEmail = prompt("Ange din e-postadress för att fortsätta:");
      if (!customerEmail) {
        alert("E-postadress krävs för att fortsätta.");
        setLoading(null);
        return;
      }
      
      const customerName = prompt("Ange ditt namn (valfritt):") || undefined;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classInstanceId: classInstance.id,
          userId: "demo-user", // Replace with actual user ID later
          customerEmail: customerEmail,
          customerName: customerName,
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
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Schema & Boka</h1>
          <p className={styles.subtitle}>
            Boka klasser upp till {selectedStudio === "stockholm-city" ? "7" : "5"} dagar framåt
            (beroende på medlemskap)
          </p>
        </div>

        {/* Studio selector */}
        <div className={styles.studioSelector}>
          {studios.map((studio) => (
            <button
              key={studio.id}
              className={`${styles.studioBtn} ${
                selectedStudio === studio.id ? styles.active : ""
              }`}
              onClick={() => setSelectedStudio(studio.id)}
            >
              {studio.name}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <FilterChips
            label="Kategori"
            options={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <FilterChips
            label="Intensitet"
            options={intensities}
            selected={selectedIntensity}
            onSelect={setSelectedIntensity}
          />
        </div>

        {/* Policy box */}
        <div className={styles.policyBox}>
          <p className={styles.policyText}>
            <strong>Bokningsfönster:</strong> Base 5 dagar • Flex 7 dagar • Studio+ 9 dagar •{" "}
            <strong>Avbokning:</strong> 2h före start • <strong>Köplats?</strong> Vi pushar dig om
            du får plats
          </p>
        </div>

        {/* Class list */}
        <div className={styles.classList}>
          <h2 className={styles.classListTitle}>
            {filteredClasses.length} klasser tillgängliga
          </h2>
          <div className={styles.classGrid}>
            {filteredClasses.map((classInstance) => (
              <ClassCard
                key={classInstance.id}
                classInstance={classInstance}
                onBook={() => handleBookClass(classInstance)}
                loading={loading === classInstance.id}
              />
            ))}
          </div>
        </div>

        {filteredClasses.length === 0 && (
          <div className={styles.emptyState}>
            <p>Inga klasser matchar dina filter. Prova att ändra urvalet.</p>
          </div>
        )}
      </div>
    </div>
  );
}






