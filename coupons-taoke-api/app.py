from flask import Flask, request
import json
from top.api.rest.TbkDgMaterialOptionalRequest import TbkDgMaterialOptionalRequest
from top.api.rest.TbkTpwdCreateRequest import TbkTpwdCreateRequest
from top.api.rest.TbkItemInfoGetRequest import TbkItemInfoGetRequest
from top import appinfo
from ddk.api.rest.DdkGoodsSearch import DdkGoodsSearch
from ddk.api.rest.DdkGoodsDetail import DdkGoodsDetail
from ddk.api.rest.DdkGoodsPromotionUrlGenerate import DdkGoodsPromotionUrlGenerate

from config import tb_appkey, tb_secret, tb_pid, pdd_client_id, pdd_client_secret, pdd_custom_parameters, pdd_pid

app = Flask(__name__)

pdd_tb_key_map = {
    'pict_url': 'goods_image_url',
    'short_title': 'goods_name',
    'zk_final_price': 'zk_final_price',
    'reserve_price': 'min_group_price',
    'volume': 'sales_tip',
    'url': 'goods_image_url',
    'goods_id': 'goods_id',
    'search_id': 'search_id',
    'goods_sign': 'goods_sign',
}


# 搜索物料
@app.route("/tbSearch", methods=["POST"])
def tb_search():
    response = dict()
    response['error_code'] = 0
    response['error_msg'] = ''
    req = TbkDgMaterialOptionalRequest()
    req.set_app_info(appinfo(tb_appkey, tb_secret))
    if request.method == 'POST':
        data = []
        params = request.form.to_dict()
        try:
            req.adzone_id = tb_pid
            for key in params:
                if key in req.__dict__:
                    setattr(req, key, params[key])
            resp = req.getResponse()
            for res in resp['tbk_dg_material_optional_response']['result_list']['map_data']:
                _dict = dict()
                for tb_key in pdd_tb_key_map:
                    _dict[tb_key] = res.get(tb_key, None)
                data.append(_dict)
            response['data'] = data
        except Exception as e:
            import traceback
            traceback.print_exc()
            response['error_code'] = 1
            response['error_msg'] = str(e)
    data = json.dumps(response)
    return data, 200, {"ContentType": "application/json"}


# 淘口令生成
@app.route("/tbTpwdCreate", methods=["POST"])
def tb_tpwd_create():
    response = dict()
    response['error_code'] = 0
    response['error_msg'] = ''
    req = TbkTpwdCreateRequest()
    req.set_app_info(appinfo(tb_appkey, tb_secret))
    if request.method == 'POST':
        params = request.form.to_dict()
        try:
            req.adzone_id = tb_pid
            for key in params:
                if key in req.__dict__:
                    setattr(req, key, params[key])
            resp = req.getResponse()
            response['data'] = resp['tbk_tpwd_create_response']['data']['model']
        except Exception as e:
            response['error_code'] = 1
            response['error_msg'] = str(e)
    data = json.dumps(response)
    return data, 200, {"ContentType": "application/json"}


@app.route("/tbDetail", methods=["POST"])
def tb_detail():
    response = dict()
    response['error_code'] = 0
    response['error_msg'] = ''
    req = TbkItemInfoGetRequest()
    req.set_app_info(appinfo(tb_appkey, tb_secret))
    if request.method == 'POST':
        params = request.form.to_dict()
        try:
            for key in params:
                if key in req.__dict__:
                    setattr(req, key, params[key])
            resp = req.getResponse()
            response['data'] = resp['tbk_item_info_get_response']['results']['n_tbk_item'][0]
        except Exception as e:
            response['error_code'] = 1
            response['error_msg'] = str(e)
    data = json.dumps(response)
    return data, 200, {"ContentType": "application/json"}


@app.route("/pddSearch", methods=["POST"])
def pdd_search():
    response = dict()
    response['error_code'] = 0
    response['error_msg'] = ''
    req = DdkGoodsSearch()
    req.set_app_info(appinfo(pdd_client_id, secret=pdd_client_secret))
    if request.method == 'POST':
        data = []
        params = request.form.to_dict()
        try:
            req.pid = pdd_pid
            req.custom_parameters = pdd_custom_parameters
            for key in params:
                if key in req.__dict__:
                    setattr(req, key, params[key])
            resp = req.getResponse()
            for res in resp['goods_search_response']['goods_list']:
                _dict = dict()
                for tb_key in pdd_tb_key_map:
                    pdd_key = pdd_tb_key_map[tb_key]

                    if tb_key == 'zk_final_price':
                        _dict[tb_key] = round((res.get('min_group_price', 0) - res.get('coupon_discount', 0)) / 100, 2)
                    elif tb_key == 'reserve_price':
                        _dict[tb_key] = round(res.get(pdd_key, 0) / 100, 2)
                    else:
                        _dict[tb_key] = res.get(pdd_key, None)
                data.append(_dict)
            response['data'] = data
        except Exception as e:
            response['error_code'] = 1
            response['error_msg'] = str(e)
    data = json.dumps(response)
    return data, 200, {"ContentType": "application/json"}


@app.route("/pddDetail", methods=["POST"])
def pdd_detail():
    response = dict()
    response['error_code'] = 0
    response['error_msg'] = ''
    req = DdkGoodsDetail()
    req.set_app_info(appinfo(pdd_client_id, secret=pdd_client_secret))
    if request.method == 'POST':
        params = request.form.to_dict()
        try:
            goods_id = params['goods_id']
            req.goods_id_list = f'[{goods_id}]'
            req.custom_parameters = pdd_custom_parameters
            for key in params:
                if key in req.__dict__:
                    setattr(req, key, params[key])
            resp = req.getResponse()
            response['data'] = resp
        except Exception as e:
            response['error_code'] = 1
            response['error_msg'] = str(e)
    data = json.dumps(response)
    return data, 200, {"ContentType": "application/json"}


@app.route("/pddPromotionUrlGenerate", methods=["POST"])
def pdd_promotion_url_generate():
    response = dict()
    response['error_code'] = 0
    response['error_msg'] = ''
    req = DdkGoodsPromotionUrlGenerate()
    req.set_app_info(appinfo(pdd_client_id, secret=pdd_client_secret))
    if request.method == 'POST':
        params = request.form.to_dict()
        try:
            goods_id = params['goods_id']
            req.goods_id_list = f'[{goods_id}]'
            req.custom_parameters = pdd_custom_parameters
            req.p_id = pdd_pid
            for key in params:
                if key in req.__dict__:
                    setattr(req, key, params[key])
            resp = req.getResponse()
            response['data'] = resp
        except Exception as e:
            response['error_code'] = 1
            response['error_msg'] = str(e)
    data = json.dumps(response)
    return data, 200, {"ContentType": "application/json"}


if __name__ == '__main__':
    app.run(debug=True)
