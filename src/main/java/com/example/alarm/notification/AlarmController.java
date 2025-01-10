package com.example.alarm.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alarms")
public class AlarmController {
    private final List<Alarm> alarmCache = new ArrayList<>();

    @Autowired
    private EmailService emailService;

    @GetMapping
    public List<Alarm> getAlarms() {
        return alarmCache;
    }

    @PostMapping
    public String addAlarm(@RequestBody Alarm alarm) {
        if (alarm.getEmail() == null || alarm.getEmail().isEmpty()) {
            return "Email is required to set an alarm.";
        }

        alarmCache.add(alarm);

        String emailSubject = "New Alarm Notification";
        String emailContent = String.format(
            "Hello,\n\nYou have set a new alarm:\nTime: %s\nMessage: %s\n\nBest regards,\nYour Alarm App",
            alarm.getTime(),
            alarm.getMessage()
        );

        emailService.sendEmail(alarm.getEmail(), emailSubject, emailContent);

        return "Alarm saved successfully and email sent to " + alarm.getEmail() + "!";
    }

    @DeleteMapping
    public String clearAlarms() {
        alarmCache.clear();
        return "All alarms cleared!";
    }

    @PostMapping("/notify")
    public String notifyUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String message = payload.get("message");

        if (email == null || email.isEmpty() || message == null || message.isEmpty()) {
            return "Invalid email or message.";
        }

        String emailSubject = "Alarm Notification";
        emailService.sendEmail(email, emailSubject, message);

        return "Email sent to " + email + "!";
    }
}

@Controller
class WebController {
    @GetMapping("/")
    public String redirectToOogoeAlarm() {
        return "redirect:/OogoeAlarm";
    }

    @GetMapping("/OogoeAlarm")
    public String showIndex() {
        return "forward:/index.html";
    }
}

