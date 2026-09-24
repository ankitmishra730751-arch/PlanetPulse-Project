package com.ankit.backend.service;

import org.springframework.stereotype.Service;

@Service
public class CarbonCalculatorService {

    public double calculateCo2(String type, double quantity) {

        double factor;

        switch (type.toLowerCase()) {

            case "car":
                factor = 0.20;
                break;

            case "bus":
                factor = 0.08;
                break;

            case "flight":
                factor = 0.25;
                break;

            case "electricity":
                factor = 0.80;
                break;

            case "veg meal":
                factor = 0.5;
                break;

            case "non-veg meal":
                factor = 2.0;
                break;

            default:
                throw new IllegalArgumentException("Invalid activity type");
        }

        return quantity * factor;
    }
}
