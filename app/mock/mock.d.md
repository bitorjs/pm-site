## 模拟数据

1. 直接生成模拟数据

```javascript
Mock.mock(模板|function)
```

1. 为接口地址模拟数据

```javascript
Mock.mock(url,模板|function)
```

1. 为接口以及请求方式模拟数据

```javascript
Mock.mock(url,type,模板|function)
```

说明：url也可以是一个字符串也可以是一个正则。

## 模板语法

模拟数据时要根据模板来模拟，模板是一个对象类型的值，格式为：

```javascript
'名称|规则':'值'
```

名称：模拟的数据的名字。 值：模拟的数据的值。 规则：模拟出数据的规则，常用的几个规则：   

1. min-max：生成的范围
2. count：生成的数量
3. +step：递增step

## 生成随机数据

| Type     | Method                                                       |
| -------- | ------------------------------------------------------------ |
| 基本类型 | boolean, natural, integer, float, character, string, range, date, time, datetime, now |
| 图片     | image, dataImage                                             |
| 颜色     | color                                                        |
| 文本     | paragraph, sentence, word, title, cparagraph, csentence, cword, ctitle |
| 姓名     | first, last, name, cfirst, clast, cname                      |
| 网站     | url, domain, email, ip, tld                                  |
| 地址     | area, region                                                 |
| 编号     | guid, id                                                     |

使用时我们只需要把值设置成 **@方法名** 即可

1.生成boolean

```javascript
@boolean
```

2.生成数字

```javascript
2.1 自然数(>=0整数)

@natural
@natural(min,max)

2.2 整数

@integer
@integer(min,max)

2.3小数

@float
@float(min,max,dmin,dmax)
    dmin：小数部分位数最小值
    dmax：小数部分位数最大值

2.4 整数整组

@range(min,max)  
@range(min,max,step)    
step：递增的步长

@range(10)
// => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
@range(3, 7)
// => [3, 4, 5, 6]
@range(1, 10, 2)
// => [1, 3, 5, 7, 9]
@range(1, 10, 3)
// => [1, 4, 7]
```

3.生成文本

```javascript
3.1单个字符

@character  
@character('lower/upper/number/symbol')  
@character(pool) 

    如果传入了 `'lower'` 或 `'upper'`、`'number'`、`'symbol'`，表示从内置的字符池中选取一个字符：

{
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    number: "0123456789",
    symbol: "!@#$%^&*()[]"
}

3.2字符串

@string  
@string(length)  
@string(min,max)  

3.3英文单词

@word  
@word(length)  
@word(min,max)  

3.4英文句子

@sentence  
@sentence(len)  
@sentence(min,max)  

3.5英文段落

@paragraph  
@paragraph(len)  
@paragraph(min,max)  

3.5中文汉字

@cword  
@cword(pool)  
@cword(len)  
@cword(pool,len)  
@cword(min,max)  
@cword(pool,min,max)  

@cword()
// => "干"
@cword('零一二三四五六七八九十')
// => "六"
@cword(3)
// => "别金提"
@cword('零一二三四五六七八九十', 3)
// => ""七七七""
@cword(5, 7)
// => "设过证全争听"
@cword('零一二三四五六七八九十', 5, 7)
// => "九七七零四"

3.6中文句子

@csentence  
@csentence(len)  
@csentence(min,max)  

3.7中文段落

@cparagraph   
@cparagraph(len)  
@cparagraph(min,max)  

3.8中文标题

@ctitle  
@ctitle(len)  
@ctitle(min,max)  
```

4.生成名字

```javascript
4.1英文名

@first  
    名  
@last  
姓  
@name  
    姓名  
@name(middle)  
    middle：是否生成中间名字  

@name()  
// => "Larry Wilson"  
@name(true)  
// => "Helen Carol Martinez"  

4.2中文名

@cfirst  
    姓  
@clast  
    名  
@cname  
    姓名  

@cname()
// => "袁军"
```

5.网站

```javascript
5.1生成一个IP

@ip

5.2生成一个Email

@email  
@email(domain)  
    domain：指定域名  

@email()
// => "x.davis@jackson.edu"
@email('nuysoft.com')
// => "h.pqpneix@nuysoft.com"

5.3生成域名

@domain

5.4生成URL

@url  
@url(protocol,host)  
    protocol：指定协议，例如HTTP  
    host：指定域名  

@url()
// => "mid://axmg.bg/bhyq"
@url('http')
// => "http://splap.yu/qxzkyoubp"
@url('http', 'nuysoft.com')
```

6.生成时间

```javascript
6.1基本用法

@date  
@time  
@datetime  

6.2格式化时间

可以通过 format 参数设置时间的格式  

@date(format)  
@time(format)  
@datetime(format)  

| Format | Description                                              | Example      |
| ------ | -------------------------------------------------------- | ------------ |
| yyyy   | A full numeric representation of a year, 4 digits        | 1999 or 2003 |
| yy     | A two digit representation of a year                     | 99 or 03     |
| y      | A two digit representation of a year                     | 99 or 03     |
| MM     | Numeric representation of a month, with leading zeros    | 01 to 12     |
| M      | Numeric representation of a month, without leading zeros | 1 to 12      |
| dd     | Day of the month, 2 digits with leading zeros            | 01 to 31     |
| d      | Day of the month without leading zeros                   | 1 to 31      |
| HH     | 24-hour format of an hour with leading zeros             | 00 to 23     |
| H      | 24-hour format of an hour without leading zeros          | 0 to 23      |
| hh     | 12-hour format of an hour without leading zeros          | 1 to 12      |
| h      | 12-hour format of an hour with leading zeros             | 01 to 12     |
| mm     | Minutes, with leading zeros                              | 00 to 59     |
| m      | Minutes, without leading zeros                           | 0 to 59      |
| ss     | Seconds, with leading zeros                              | 00 to 59     |
| s      | Seconds, without leading zeros                           | 0 to 59      |
| SS     | Milliseconds, with leading zeros                         | 000 to 999   |
| S      | Milliseconds, without leading zeros                      | 0 to 999     |
| A      | Uppercase Ante meridiem and Post meridiem                | AM or PM     |
| a      | Lowercase Ante meridiem and Post meridiem                | am or pm     |
| T      | Milliseconds, since 1970-1-1 00:00:00 UTC                | 759883437303 |
```

1. 生成地址7.1生成中国大区  @region  @region()   // => "华北"  7.2生成省份  @province    7.3生成城市  @city   @city(prefix)   	prefix：布尔值，是否生成所属的省    @city() // => "唐山市" @city(true) // => "福建省 漳州市"  7.4生成县  @county   @county(prefix)   	prefix：布尔值，是否生成所属省、    @county() // => "上杭县" @county(true) // => "甘肃省 白银市 会宁县"  7.5生成邮政编码   @zip 

8.编号

```javascript
8.1身份证

@id

@id()  
 // => "420000200710091854"

8.2GUID

@guid 

@guid()
// => "662C63B4-FD43-66F4-3328-C54E3FF0D56E"
```

9.生成图片

```javascript
9.1图片URL

@image()  
@image( size )  
@image( size, background )  
@image( size, background, text )  
@image( size, background, foreground, text )  
@image( size, background, foreground, format, text )  
    size：尺寸，格式为：'宽x高'  
    background：背景色，格式为：#FFFFFF  
    text：图片上显示的文本  
    foreground：广本颜色  
    format：图片格式，可选值包括：png、gif、jpg。  

@image  
// => "http://dummyimage.com/125x125"  
@image('200x100')  
// => "http://dummyimage.com/200x100"    
@image('200x100', '#fb0a2a')  
// => "http://dummyimage.com/200x100/fb0a2a"    
@image('200x100', '#02adea', 'Hello')  
// => "http://dummyimage.com/200x100/02adea&text=Hello"  
@image('200x100', '#00405d', '#FFF', 'Mock.js')  
// => "http://dummyimage.com/200x100/00405d/FFF&text=Mock.js"  
@image('200x100', '#ffcc33', '#FFF', 'png', '!')  
// => "http://dummyimage.com/200x100/ffcc33/FFF.png&text=!"  



9.2Base64图片编码

@dataImage  
@dataImage(size)  
@dataImage(size,text)  
```

10.生成颜色

```javascript
@color  
@hex  
@rgb  
@rgba  
@hsl  
```

