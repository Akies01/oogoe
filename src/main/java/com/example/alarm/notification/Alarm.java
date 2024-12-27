package com.example.alarm.notification;

public class Alarm {
    private String time;
    private String message;
    private String email;

    public Alarm(String time, String message, String email) {
        this.time = time;
        this.message = message;
        this.email = email;
    }

    public Alarm() {}

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
