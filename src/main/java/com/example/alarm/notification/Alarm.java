package com.example.alarm.notification;

public class Alarm {
    private String time;
    private String message;

    public Alarm(String time, String message) {
        this.time = time;
        this.message = message;
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
}
