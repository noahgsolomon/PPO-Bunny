import random
import Constants

WIDTH, HEIGHT = Constants.WIDTH, Constants.HEIGHT

class Snake:

    def __init__(self):

        x = random.randint(15, WIDTH-30)
        x -= x % 15 or 0
        #x = (lambda num: num - num % 15 or 1)(random.randint(100, 1000))

        y = random.randint(100, HEIGHT-30)
        y -= y % 15 or 0

        self.head = [x,y]
        self.tail = [[x,y]]
