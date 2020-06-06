#coding=utf-8
# package
import sys  
import json
import threading
import time
# from threading import Lock

lock = threading.Lock()
f = open(r'D:\trade\host1_tsalfI\Application\Home\Controller\json.txt', 'r') 
try: 
    params = f.read() 
    params = params.split(' ')
    data = json.loads(params[3].replace("'", '"'))
    respondContent = json.loads(params[4].replace("'", '"'))
    to = int(params[1])
    step = int(params[2])
    pi = int(params[0])
except Exception as e:
    print(e)
finally:
    f.close()

def run(n, ends):
    try:
        # get php params
        # params = sys.argv[1:]
        # data = json.loads(params[3].replace("'", '"'))
        # respondContent = json.loads(params[4].replace("'", '"'))

        # change read file


        # print test
        # print(data);

        # while data
        i = n
        try:
            while  i < ends:
                trans_amount=0
                max_price=0
                min_price=0
                tmp=0
                open_price = 0
                close_price = 0
                x = 0
                for val in data:
                    if int(val['addtime']) > i and int(val['addtime']) <= i + step:
                        if float(val['price']) > max_price:
                            max_price = float(val['price'])
                        if min_price == 0:    
                            min_price = float(val['price'])
                        elif float(val['price']) < min_price:
                                if float(val['price']) < min_price:
                                    min_price = float(val['price'])

                        trans_amount += float(val['num'])
                        if tmp == 0:
                            open_price = float(val['price'])
                        close_price = float(val['price'])
                        tmp+=1
                        data.pop(0)
                #print('ttl')
                lock.acquire()
                respondContent['t'].append(i+step)
                respondContent['h'].append(max_price)
                respondContent['c'].append(close_price)
                respondContent['l'].append(min_price)
                respondContent['o'].append(open_price)
                respondContent['v'].append(trans_amount)  
                lock.release()   
                i+=step
        except Exception as e:
            print(e)

        respondContent['s'] = 'ok'



        # print(json.dumps(respondContent))
        # return json.dumps(respondContent)
    except Exception as e:
        print(e)

# start thread
# t = threading.Thread(target=run, args=(pi,to,))
# t.start()
# print(t)

# t1 = threading.Thread(target=run, args=(pi,to,))
# t1.start()
# t1.join()


jobs = []
def startThread(s,t):
    t = threading.Thread(target=run, args=(s,t,))
    t.start()
    jobs.append(t)

# base data
base = 500
# current flg
ts = 0
# fork
for fork in range(0,20):
    if pi+(fork+1)*(step+base) < to:
        startThread(pi+fork*(step+base), pi+(fork+1)*(step+base),)
        ts = fork

tmk = pi+(ts+1)*(step+base)
if tmk < to:
    startThread(tmk, to)

for i in jobs:
    i.join()    

print(json.dumps(respondContent))