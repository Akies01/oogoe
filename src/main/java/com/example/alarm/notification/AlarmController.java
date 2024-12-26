package com.example.alarm.notification;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/alarms")
public class AlarmController {
    private final List<Alarm> alarmCache = new ArrayList<>();

    @GetMapping
    public List<Alarm> getAlarms() {
        return alarmCache;
    }

    @PostMapping
    public String addAlarm(@RequestBody Alarm alarm) {
        alarmCache.add(alarm);
        return "Alarm saved successfully!";
    }

    @DeleteMapping
    public String clearAlarms() {
        alarmCache.clear();
        return "All alarms cleared!";
    }
}
