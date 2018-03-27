#!/usr/bin/env python

gwind = 22
ghum = 15
gprecip = 43
gfuel = 22
gslope = 13

def main():
    calculateAfti(gwind, ghum, gprecip, gfuel, gslope)

def calculateAfti(wind, hum, precip, fuel, slope):
    #WIND
    if wind >= 0 and wind < 6:
        w = 1
    elif wind >= 6 and wind < 12:
        w = 2
    elif wind >= 12 and wind < 19:
        w = 3
    elif wind >= 19:
        w = 4
    #HUMIDITY
    if hum >= 76 and hum < 100:
        h = 1
    elif hum >= 75 and hum < 51:
        h = 2
    elif hum >= 50 and hum < 26:
        h = 3
    elif hum <= 25:
        h = 4
    #PRECIPITATION
    p = precip
    #FUEL
    if fuel >= 0 and fuel < 12:
        w = 1
    elif fuel >= 13 and fuel < 25:
        w = 2
    elif fuel >= 26 and fuel < 38:
        w = 3
    elif fuel >= 39:
        w = 4
    #SLOPE
    if slope >= 0 and slope < 5:
        s = 1
    elif slope >= 6 and slope < 15:
        s = 2
    elif slope >= 16 and slope < 30:
        s = 3
    elif slope >= 31:
        s = 4
    print("Wind: {}  Humidity: {}  Precip: {}  Fuel: {}  Slope: {}".format(w,h,p,f,s)



if __name__ == "__main__"
    main()