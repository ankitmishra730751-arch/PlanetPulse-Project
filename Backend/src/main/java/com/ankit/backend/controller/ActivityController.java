package com.ankit.backend.controller;

import com.ankit.backend.entity.Activity;
import com.ankit.backend.repository.ActivityRepository;
import com.ankit.backend.service.CarbonCalculatorService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "*")
public class ActivityController {

    private final ActivityRepository activityRepository;
    private final CarbonCalculatorService carbonCalculatorService;

    public ActivityController(
            ActivityRepository activityRepository,
            CarbonCalculatorService carbonCalculatorService) {

        this.activityRepository = activityRepository;
        this.carbonCalculatorService = carbonCalculatorService;
    }

    // 1. Add Activity
    @PostMapping
    public Activity addActivity(@RequestBody Activity activity) {

        double co2 = carbonCalculatorService.calculateCo2(
                activity.getType(),
                activity.getQuantity()
        );

        activity.setCo2(co2);

        if (activity.getDate() == null) {
            activity.setDate(LocalDate.now());
        }

        return activityRepository.save(activity);
    }

    // 2. Get All Activities
    @GetMapping
    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    // 3. Dashboard
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() {

        List<Activity> activities = activityRepository.findAll();

        double total = activities.stream()
                .mapToDouble(Activity::getCo2)
                .sum();

        double transport = activities.stream()
                .filter(a ->
                        a.getType().equalsIgnoreCase("car") ||
                                a.getType().equalsIgnoreCase("bus") ||
                                a.getType().equalsIgnoreCase("flight"))
                .mapToDouble(Activity::getCo2)
                .sum();

        double food = activities.stream()
                .filter(a ->
                        a.getType().equalsIgnoreCase("veg meal") ||
                                a.getType().equalsIgnoreCase("non-veg meal"))
                .mapToDouble(Activity::getCo2)
                .sum();

        double electricity = activities.stream()
                .filter(a ->
                        a.getType().equalsIgnoreCase("electricity"))
                .mapToDouble(Activity::getCo2)
                .sum();

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("totalCO2", total);
        result.put("transport", transport);
        result.put("food", food);
        result.put("electricity", electricity);
        result.put("activityCount", activities.size());

        return result;
    }

    // 4. Filter Activities
    @GetMapping("/filter")
    public List<Activity> filterActivities(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        List<Activity> activities = activityRepository.findAll();

        return activities.stream()
                .filter(a -> {
                    if (type == null || type.isBlank()) {
                        return true;
                    }
                    return a.getType().equalsIgnoreCase(type);
                })
                .filter(a -> {
                    if (from == null || from.isBlank()) {
                        return true;
                    }
                    LocalDate fromDate = LocalDate.parse(from);
                    return !a.getDate().isBefore(fromDate);
                })
                .filter(a -> {
                    if (to == null || to.isBlank()) {
                        return true;
                    }
                    LocalDate toDate = LocalDate.parse(to);
                    return !a.getDate().isAfter(toDate);
                })
                .collect(Collectors.toList());
    }
    @GetMapping("/weekly")
    public Map<String, Object> getWeeklyProgress() {

        List<Activity> activities = activityRepository.findAll();

        LocalDate today = LocalDate.now();

        LocalDate monday = today.minusDays(
                today.getDayOfWeek().getValue() - 1
        );

        LocalDate sunday = monday.plusDays(6);

        double weeklyTotal = activities.stream()
                .filter(a ->
                        !a.getDate().isBefore(monday) &&
                                !a.getDate().isAfter(sunday))
                .mapToDouble(Activity::getCo2)
                .sum();

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("weekStart", monday);
        result.put("weekEnd", sunday);
        result.put("weeklyCO2", weeklyTotal);

        return result;
    }
}