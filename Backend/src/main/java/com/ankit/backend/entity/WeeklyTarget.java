package com.ankit.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "weekly_target")
public class WeeklyTarget {

    @Id
    private Long id = 1L;

    private Double target;

    public WeeklyTarget() {
    }

    public WeeklyTarget(Double target) {
        this.id = 1L;
        this.target = target;
    }

    public Long getId() {
        return id;
    }

    public Double getTarget() {
        return target;
    }

    public void setTarget(Double target) {
        this.target = target;
    }
}