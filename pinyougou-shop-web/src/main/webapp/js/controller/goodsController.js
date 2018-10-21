//控制层
app.controller('goodsController', function ($scope, $controller, $location,goodsService, uploadService, itemCatService, typeTemplateService)
{

    $controller('baseController', {$scope: $scope});//继承

    //读取列表数据绑定到表单中  
    $scope.findAll = function ()
    {
        goodsService.findAll().success(
            function (response)
            {
                $scope.list = response;
            }
        );
    }

    //分页
    $scope.findPage = function (page, rows)
    {
        goodsService.findPage(page, rows).success(
            function (response)
            {
                $scope.list = response.rows;
                $scope.paginationConf.totalItems = response.total;//更新总记录数
            }
        );
    }

    //查询实体 注意:此处不要传参!
    $scope.findOne = function ()
    {
        var id = $location.search()['id'];
        if(id!=null)
        {
            goodsService.findOne(id).success(
                function (response)
                {
                    $scope.entity = response;
                    editor.html($scope.entity.goodsDesc.introduction);//获取富文本编辑器里面的内容
                    //因为没有开服务器 所以不做测试
                    $scope.entity.goodsDesc.itemImages = JSON.parse($scope.entity.goodsDesc.itemImages);

                    //http://localhost:9102/admin/goods_edit.html#?id=149187842867965

                    //因为被Scope.$watch(...typeTemplateId' ) 覆盖了
                    $scope.entity.goodsDesc.customAttributeItems=
                        JSON.parse($scope.entity.goodsDesc.customAttributeItems);

                    //这里转换只要是要在 checkAttributeValue() 方法中调用
                    $scope.entity.goodsDesc.specificationItems = JSON.parse($scope.entity.goodsDesc.specificationItems)

                    for(var i = 0;i< $scope.entity.itemList.length;i++)
                    {
                        $scope.entity.itemList[i].spec = JSON.parse($scope.entity.itemList[i].spec);
                    }
                }
            );
        }
    }

    $scope.checkAttributeValue = function (specName, optionName)
    {
        var items = $scope.entity.goodsDesc.specificationItems;
        //调用baseController中的判断集合中是否具有该元素的方法
        var object = $scope.searchObjectByKey(items, 'attributeName', specName);
        if(object!=null)
        {
            if(object.attributeValue.indexOf(optionName)>=0)
            {
                return true;
            }else
            {
                return false;
            }
        }else
        {
            return false;
        }
    };

    //保存 有了保存就可以删掉add方法了
    $scope.save = function ()
    {
        $scope.entity.goodsDesc.introduction = editor.html();

        var serviceObject;//服务层对象
        if ($scope.entity.goods.id != null)
        {//如果有ID
            serviceObject = goodsService.update($scope.entity); //修改
        } else
        {
            serviceObject = goodsService.add($scope.entity);//增加
        }
        serviceObject.success(
            function (response)
            {
                if (response.success)
                {
                    alert("保存成功");
/*                    因为要做保存后跳转回goods.html,因此就不再需要下面的代码了
                    $scope.entity = {};
                    editor.html("");//清空富文本编辑器*/
                    location.href = 'goods.html';
                } else
                {
                    alert(response.message);
                }
            }
        );
    }

    //增加商品 save方法既完成更新又完成添加,add可以删除了
/*    $scope.add = function ()
    {
        $scope.entity.goodsDesc.introduction = editor.html();

        goodsService.add($scope.entity).success(
            function (response)
            {
                if (response.success)
                {
                    alert("新增成功");
                    $scope.entity = {};
                    editor.html("");//清空富文本编辑器
                } else
                {
                    alert(response.message);
                }
            }
        );
    }*/


    //批量删除
    $scope.dele = function ()
    {
        //获取选中的复选框
        goodsService.dele($scope.selectIds).success(
            function (response)
            {
                if (response.success)
                {
                    $scope.reloadList();//刷新列表
                    $scope.selectIds = [];
                }
            }
        );
    }

    $scope.searchEntity = {};//定义搜索对象

    //搜索
    $scope.search = function (page, rows)
    {
        goodsService.search(page, rows, $scope.searchEntity).success(
            function (response)
            {
                $scope.list = response.rows;
                $scope.paginationConf.totalItems = response.total;//更新总记录数
            }
        );
    }

    //上传图片
    $scope.uploadFile = function ()
    {
        uploadService.uploadFile().success(
            function (response)
            {
                if (response.success)
                {
                    $scope.image_entity.url = response.message;
                } else
                {
                    alert(response.message);
                }
            }
        );


    }

    $scope.entity = {goodsDesc: {itemImages: [], specificationItems: []}};

    //将当前上传的图片实体存入图片列表
    $scope.add_image_entity = function ()
    {
        $scope.entity.goodsDesc.itemImages.push($scope.image_entity);
    }

    //移除图片
    $scope.remove_image_entity = function (index)
    {
        $scope.entity.goodsDesc.itemImages.splice(index, 1);
    }

    //获取一级模板名
    $scope.selectItemCat1List = function ()
    {
        itemCatService.findByParentId(0).success(function (response)
        {
            $scope.itemCat1List = response;
        });
    };
    //获取二级模板名
    $scope.$watch('entity.goods.category1Id', function (newvalue, oldvalue)
    {
        itemCatService.findByParentId(newvalue).success(function (response)
        {
            $scope.itemCat2List = response;
        });
    })

    //获取三级模板名
    $scope.$watch('entity.goods.category2Id', function (newvalue, oldvalue)
    {
        itemCatService.findByParentId(newvalue).success(function (response)
        {
            $scope.itemCat3List = response;
        });
    })

    //获取模板名
    $scope.$watch('entity.goods.category3Id', function (newvalue, oldvalue)
    {
        itemCatService.findOne(newvalue).success(function (response)
        {
            $scope.entity.goods.typeTemplateId = response.typeId
        });
    })
    //获取品牌下拉列表 监听到变化的时候同时加载规格选项列表
    $scope.$watch('entity.goods.typeTemplateId', function (newvalue, oldvalue)
    {
        typeTemplateService.findOne(newvalue).success(function (response)
        {
            $scope.typeTemplate = response;
            $scope.typeTemplate.brandIds = JSON.parse(response.brandIds);
            //获取扩展属性表 返回是string 但是可以当做表中表使用
            //day07_v9 我们读取出来的值被覆盖了，我们需要改写代码, 添加判断，当用户没有传递id参数时再执行此逻辑
            if($location.search()['id']==null){
                $scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.typeTemplate.customAttributeItems);//扩展属性
            }
        });

        //可以再开一个方法
        typeTemplateService.findSpecList(newvalue).success(function (response)
        {
            /*{"id":32,"text":"机身内存","options":[{"id":118,"optionName":"16G","orders":1,"specId":32},
            {"id":119,"optionName":"32G","orders":2,"specId":32},
            {"id":120,"optionName":"64G","orders":3,"specId":32},
            {"id":121,"optionName":"128G","orders":4,"specId":32}]}]*/
            $scope.specList = response;
        });
    })

    $scope.updateSpecAttribute = function ($event, name, value)
    {
        var object = $scope.searchObjectByKey($scope.entity.goodsDesc.specificationItems, 'attributeName', name);
        if (object != null)
        {
            if ($event.target.checked)
            {
                object.attributeValue.push(value);
            } else
            {
                object.attributeValue.splice(object.attributeValue.indexOf(value), 1);
                //如果选项都取消了，将此条记录移除
                if (object.attributeValue.length == 0)
                {
                    $scope.entity.goodsDesc.specificationItems.splice($scope.entity.goodsDesc.specificationItems.indexOf(object), 1)
                }
            }
        } else
        {
            $scope.entity.goodsDesc.specificationItems.push({"attributeName": name, "attributeValue": [value]});
        }
    };

    //创建SKU列表
    $scope.createItemList = function ()
    {
        //itemList 每一条记录是一个sku 最开始就有一条,只不过spec为空
        $scope.entity.itemList = [{spec: {}, price: 0, num: 99999, status: '0', isDefault: '0'}];//初始
        var items = $scope.entity.goodsDesc.specificationItems;
        //items的attributeName对应的每一个attributeValue就会克隆一条itemList
        //[{“attributeName”:”规格名称”,”attributeValue”:[“规格选项1”,“规格选项2”.... ]  } , ....  ]
        for (var i = 0; i < items.length; i++)
        {
            $scope.entity.itemList = addColumn($scope.entity.itemList, items[i].attributeName, items[i].attributeValue);
        }
    };

    //添加列值
    addColumn = function (list, columnName, columnValues)
    {
        var newList = [];//新的集合
        for (var i = 0; i < list.length; i++)
        {
            var oldRow = list[i];
            for (var j = 0; j < columnValues.length; j++)
            {
                var newRow = JSON.parse(JSON.stringify(oldRow));
                newRow.spec[columnName] = columnValues[j];
                newList.push(newRow);
            }
        }
        return newList;
    }

    $scope.status = ['未审核', '已审核', '审核未通过', '已关闭'];

    $scope.itemCatList = [];//里面存的是 [{response.id:response.name},..]
    $scope.findItemCatList = function ()
    {
        //获取所有的数据并存到集合,通过iterCatList[key]获取值
        itemCatService.findAll().success(function (response)
        {
            for (var i = 0; i < response.length; i++)
            {
                $scope.itemCatList[response[i].id] = response[i].name;
            }
        });
    }
});
