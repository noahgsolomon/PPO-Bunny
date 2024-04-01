import random

HEIGHT = 25
WIDTH = 25

class Snake:

    def __init__(self):

        x = random.randint(0, WIDTH-1)

        y = random.randint(0, HEIGHT-1)

        self.head = [x,y]
        self.tail = [[x,y]]
