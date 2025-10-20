import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Trainer } from "@/types";
import styles from "./TrainerCard.module.css";

type TrainerCardProps = {
  trainer: Trainer;
};

export default function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <Card padding="lg">
      <div className={styles.card}>
        <div className={styles.avatar}>
          <img 
            src={trainer.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(trainer.name)}&size=240&background=22D3EE&color=0B1220&bold=true`} 
            alt={trainer.name} 
            className={styles.avatarImage} 
          />
        </div>

        <h3 className={styles.name}>{trainer.name}</h3>
        <p className={styles.bio}>{trainer.bio}</p>

        <div className={styles.specialties}>
          {trainer.specialties.map((specialty) => (
            <Badge key={specialty}>{specialty}</Badge>
          ))}
        </div>

        {trainer.certifications && trainer.certifications.length > 0 && (
          <div className={styles.certs}>
            <div className={styles.certsLabel}>Certifieringar:</div>
            <div className={styles.certsList}>
              {trainer.certifications.map((cert) => (
                <span key={cert} className={styles.cert}>
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

