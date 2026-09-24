package com.ankit.backend.repository;

import com.ankit.backend.entity.WeeklyTarget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeeklyTargetRepository
        extends JpaRepository<WeeklyTarget, Long> {
}