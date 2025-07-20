#include <ESP32Servo.h>
#include <M5Unified.h>
#include <Avatar.h>
Servo left;
Servo right;

using namespace m5avatar;

Avatar avatar;

uint32_t looptimer;
uint32_t now;
bool isDegreeZero;

void setup() {
  M5.begin();
  avatar.init();

  left.attach(21);
  right.attach(22);

  left.write(0);
  right.write(0);

  looptimer = millis();
  now = millis();
  isDegreeZero = true;
}


void loop() {
  now = millis();
  if (now > looptimer + 1000) {
    if (isDegreeZero) {
      left.write(180);
      right.write(180);
      isDegreeZero = false;
    } else {
      left.write(0);
      right.write(0);
      isDegreeZero = true;
    }
    looptimer = now;
  }
}
