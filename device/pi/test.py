from gpiozero import AngularServo
from gpiozero.pins.pigpio import PiGPIOFactory
from time import sleep
from pydantic import BaseModel
import requests

LEFT = 14
RIGHT= 15

MIN_DEGREE=0
MAX_DEGREE=165


class ModelResponse(BaseModel):
    reason: str
    score: int

class SessionResponse(BaseModel):
    status: bool
    message: str
    data: dict[str, ModelResponse] | None


def main():
    factory = PiGPIOFactory()
    left_servo = AngularServo(LEFT, min_angle=MIN_DEGREE, max_angle=MAX_DEGREE,
                         min_pulse_width=0.5/1000, max_pulse_width=2.4/1000, frame_width=1/50,
                         pin_factory=factory)
    right_servo = AngularServo(RIGHT, min_angle=MIN_DEGREE, max_angle=MAX_DEGREE,
                         min_pulse_width=0.5/1000, max_pulse_width=2.4/1000, frame_width=1/50,
                         pin_factory=factory)

    left_servo.angle = MIN_DEGREE
    right_servo.angle = MIN_DEGREE

    while True:
        sleep(1.0)
        left_servo.angle= MAX_DEGREE
        right_servo.angle= MAX_DEGREE

        sleep(1.0)
        left_servo.angle= MIN_DEGREE
        right_servo.angle= MIN_DEGREE


if __name__ == "__main__":
    main()
