import cv2
import numpy as np
import imutils

im = cv2.imread('../data/test1.jpg')
gray = cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 60, 150, apertureSize=3)

img = im.copy()
lines = cv2.HoughLines(edges,1,np.pi/180,200)

for line in lines:
    for rho,theta in line:
        a = np.cos(theta)
        b = np.sin(theta)
        x0 = a*rho
        y0 = b*rho
        x1 = int(x0 + 3000*(-b))
        y1 = int(y0 + 3000*(a))
        x2 = int(x0 - 3000*(-b))
        y2 = int(y0 - 3000*(a))
        cv2.line(img,(x1,y1),(x2,y2),(0,255,0),10)

cv2.imshow('houghlines',imutils.resize(img, height=650))
cv2.waitKey(0)
cv2.destroyAllWindows()