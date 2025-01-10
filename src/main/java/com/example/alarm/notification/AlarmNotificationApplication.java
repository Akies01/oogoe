package com.example.alarm.notification;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AlarmNotificationApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                              .directory("C:\\Users\\hwang\\Downloads\\alarm-notification\\src\\main\\resources\\static")
                              .filename("alarm-notification.env")
                              .load();

        System.setProperty("KEYSTORE_PASSWORD", dotenv.get("KEYSTORE_PASSWORD"));
        System.setProperty("MAIL_USERNAME", dotenv.get("MAIL_USERNAME"));
        System.setProperty("MAIL_PASSWORD", dotenv.get("MAIL_PASSWORD"));

        SpringApplication.run(AlarmNotificationApplication.class, args);
    }
}
