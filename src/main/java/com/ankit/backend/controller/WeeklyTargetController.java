package com.ankit.backend.controller;

import com.ankit.backend.entity.WeeklyTarget;
import com.ankit.backend.repository.WeeklyTargetRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/target")
@CrossOrigin(origins = "*")
public class WeeklyTargetController {

    private final WeeklyTargetRepository repository;

    public WeeklyTargetController(WeeklyTargetRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public WeeklyTarget saveTarget(@RequestBody WeeklyTarget target) {

        target = new WeeklyTarget(target.getTarget());

        return repository.save(target);
    }

    @GetMapping
    public WeeklyTarget getTarget() {

        return repository.findById(1L)
                .orElse(new WeeklyTarget(50.0));
    }
}