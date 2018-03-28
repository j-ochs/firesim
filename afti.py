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
        f = 1
    elif fuel >= 13 and fuel < 25:
        f = 2
    elif fuel >= 26 and fuel < 38:
        f = 3
    elif fuel >= 39:
        f = 4
    #SLOPE
    if slope >= 0 and slope < 5:
        s = 1
    elif slope >= 6 and slope < 15:
        s = 2
    elif slope >= 16 and slope < 30:
        s = 3
    elif slope >= 31:
        s = 4
    w = w
    p = p
    f = f
    afti = (2*w)+h+(1.6*p)+(1.2*f)+s
    print("Risk Table Results -- Wind: {}  Humidity: {}  Precip: {}  Fuel: {}  Slope: {}".format(w,h,p,f,s))
    print("AFTI Score: {}".format(afti))
    #return (w*2 + h + p*1.6 + f * 1.2 + s)

def main():
    #global gwind, ghum, gprecip, gfuel, gslope
    gwind = 44
    ghum = 15
    gprecip = 2
    gfuel = 22
    gslope = 22
    print("Input values -- Wind: {}  Humidity: {}  Precip: {}  Fuel: {}  Slope: {}".format(gwind,ghum,gprecip,gfuel,gslope))
    calculateAfti(gwind, ghum, gprecip, gfuel, gslope)

if __name__ == "__main__":
	main()