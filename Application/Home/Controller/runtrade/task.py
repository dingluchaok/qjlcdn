import sys  
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.types import CHAR,INT
import json
import threading
import time
import numpy as np

pd.set_option('display.max_columns', None)

pd.set_option('display.max_colwidth', None)

pd.set_option('display.width', None)

pd.set_option('display.max_rows', None)


# df.to_sql(name = 'test1',  
#            con = engine,
#            if_exists = 'append',
#            index = False,
#            dtype = {'id': INT(),
#                     'name': CHAR(length=2),
#                     'score': CHAR(length=2)
#                     }
#            )

lock = threading.Lock()

def qy(market='gicc_usdt', fm='', to='', limit='limit 0,1000'):
    connect_info = 'mysql+pymysql://trade:qwer110@127.0.0.1:3306/trade?charset=utf8'

    engine = create_engine(connect_info)

    sql = " select addtime, price, num  from mollymobi_trade_log where market='"+market+"' and `status`=1 and addtime between "+fm+" and "+to+" ORDER BY `addtime`  desc "+limit

    df = pd.read_sql(sql=sql, con=engine)

    return df.values


def main():
    params = sys.argv[1:]
    timeShare = int(params[0])
    bid = params[1]
    fm = int(params[2])
    to = int(params[3])
    start = int(params[4])
    step = int(params[5])
    # print(timeShare, bid, fm, to)
    pdata = np.array(qy(bid,str(fm),str(to), ''))
    # print(123)
    # cpd = []
    # for ix in pdata:
    #     cpd.append(ix)

    data = pdata
    pdata = ""

    # share data
    respondContent = {}
    respondContent['t'] = []
    respondContent['c'] = []
    respondContent['h'] = []
    respondContent['l'] = []
    respondContent['o'] = []
    respondContent['v'] = []


    def run(start,to):
        i = start
        while i <= to:
            trans_amount=0
            max_price=0
            min_price=0
            tmp=0
            open_price = 0
            close_price = 0
            sa = 0
            # filter data
            tsdata = data[np.where( (data[:,0] > i) & (data[:,0] < i + step) )]

            for val in tsdata:
                if 1 or int(val[0]) > i and int(val[0]) <= i + step:
                    if float(val[1]) > (max_price):
                        #print(val[4]) 
                        max_price = float(val[1])
                    if min_price == 0:
                        min_price = float(val[1])
                    elif float(val[1]) < min_price:
                        if float(val[1]) < min_price:
                            min_price = float(val[1])
                            #print(min_price)

                    trans_amount += float(val[2])
                    if tmp == 0:
                        open_price = float(val[1])
                        

                    close_price = float(val[1]) 
                    tmp += 1
                    #data.pop(0)

            lock.acquire()
            respondContent['t'].append(i+step)
            respondContent['h'].append(max_price)
            respondContent['c'].append(close_price)
            respondContent['l'].append(min_price)
            respondContent['o'].append(open_price)
            respondContent['v'].append(trans_amount)
            i += step
            lock.release()   
        respondContent['s'] = 'ok'
        #print(json.dumps(respondContent))


    if len(data) == 0:
        respondContent['s'] = 'no_data'
        #print(json.dumps(respondContent))
    else:
        jobs = []
        def startThread(s,t):
            t = threading.Thread(target=run, args=(s,t,))
            t.start()
            jobs.append(t)

        
        # startThread(start, to)
        base = 500
        ts = 0
        # fork
        for fork in range(0,20):
            if start + (fork+1)*(step+base) < to:
                startThread(start + fork*(step+base), start + (fork+1)*(step+base),)
                ts = fork

        tmk = start + (ts+1) * (step+base)
        if tmk < to:
            startThread(tmk, to)

        for i in jobs:
            i.join() 
        
        print(json.dumps(respondContent).replace(" ",""))

main()



