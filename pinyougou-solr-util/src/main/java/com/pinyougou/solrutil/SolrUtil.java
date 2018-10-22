package com.pinyougou.solrutil;

import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSON;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.stereotype.Component;

import com.pinyougou.mapper.TbItemMapper;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.pojo.TbItemExample;

@Component
public class SolrUtil
{
    @Autowired
    private TbItemMapper itemMapper;

    @Autowired
    private SolrTemplate solrTemplate;

    public void importItemData()
    {
        TbItemExample exam = new TbItemExample();
        TbItemExample.Criteria criteria = exam.createCriteria();
        criteria.andStatusEqualTo("1");
        List<TbItem> list = itemMapper.selectByExample(exam);
        System.out.println("开始商品列表");
        for (TbItem tbItem : list)
        {
            System.out.println(tbItem.getId() + " " + tbItem.getTitle() + " " + tbItem.getPrice());
            //提取规格json字符串转换为map
            Map map = JSON.parseObject(tbItem.getSpec(), Map.class);
            //自己定义的SpecMap属性
            tbItem.setSpecMap(map);
        }
        solrTemplate.saveBeans(list);
        solrTemplate.commit();
        System.out.println("end");

    }

    public static void main(String[] args)
    {
        ApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath*:spring/applicationContext*.xml");
        SolrUtil solrUtil = (SolrUtil) applicationContext.getBean("solrUtil");
        //为什么这里不能直接new 因为要启动spring容器
        solrUtil.importItemData();

    }
}
