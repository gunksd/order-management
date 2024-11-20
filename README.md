# order-management
# 点餐管理系统

## 1. 需求分析与应用场景

### 1.1 需求分析
本点餐管理系统旨在帮助餐馆管理菜品、订单和用户。系统的主要用户包括管理员和顾客。管理员能够对菜品进行管理，包括新增、修改、删除等操作；顾客可以浏览菜品、下单、查看历史订单以及删除订单。

### 1.2 应用场景
* **餐厅**：顾客可以通过该系统快速点餐，管理员可以随时更新菜单和库存。
* **线上餐饮**：顾客可以通过浏览菜单来下订单，方便快捷。管理员可以及时根据库存情况调整菜品。

### 1.3 系统功能
* **顾客功能**：
  - 浏览所有菜品
  - 添加菜品至订单
  - 查看历史订单
  - 删除已下订单
* **管理员功能**：
  - 添加新菜品
  - 编辑现有菜品（名称、价格、库存）
  - 删除菜品
  - 搜索菜品

## 2. 系统 E-R 图

系统的 E-R 图展示了用户（顾客与管理员）、订单、菜品及其之间的关系。以下是 E-R 图的概念描述：

* **用户（User）**：每个用户具有唯一的 ID（`user_id`），用户名（`username`），密码（`password`）以及角色（`user_type`），角色可以是顾客或管理员。
* **菜品（Dish）**：每道菜品具有唯一的 ID（`dish_id`），菜品名称（`dish_name`），价格（`price`），库存（`stock`）等属性。
* **订单（Order）**：每个订单具有唯一的 ID（`order_id`），下单的用户 ID（`user_id`），总金额（`total_amount`）以及订单创建时间（`created_at`）。
* **订单详情（Order Details）**：记录每个订单包含的菜品以及数量。

## 3. 关系模型设计

系统的关系模型设计包括以下几个主要表：

### 3.1 用户表（`user`）
| 字段名称    | 数据类型       | 说明       |
|-------------|----------------|------------|
| user_id     | INT (主键)     | 用户唯一 ID |
| username    | NVARCHAR(50)   | 用户名     |
| password    | NVARCHAR(255)  | 密码       |
| user_type   | NVARCHAR(20)   | 用户角色（顾客/管理员） |
| created_at  | DATETIME       | 注册时间   |

### 3.2 菜品表（`dish`）
| 字段名称    | 数据类型       | 说明       |
|-------------|----------------|------------|
| dish_id     | INT (主键)     | 菜品唯一 ID |
| dish_name   | NVARCHAR(100)  | 菜品名称   |
| price       | DECIMAL(10,2)  | 菜品价格   |
| stock       | INT            | 库存数量   |
| created_at  | DATETIME       | 添加时间   |

### 3.3 订单表（`order`）
| 字段名称    | 数据类型       | 说明       |
|-------------|----------------|------------|
| order_id    | INT (主键)     | 订单唯一 ID |
| user_id     | INT            | 下单用户的 ID（外键） |
| total_amount| DECIMAL(10,2)  | 总金额     |
| created_at  | DATETIME       | 订单创建时间 |

### 3.4 订单详情表（`order_details`）
| 字段名称    | 数据类型       | 说明       |
|-------------|----------------|------------|
| detail_id   | INT (主键)     | 订单详情唯一 ID |
| order_id    | INT            | 所属订单 ID（外键） |
| dish_id     | INT            | 菜品 ID（外键） |
| quantity    | INT            | 菜品数量   |

### 3.5 关系描述
* `user` 与 `order` 之间是一对多关系：一个用户可以有多个订单。
* `order` 与 `order_details` 之间是一对多关系：一个订单可以包含多个菜品。
* `dish` 与 `order_details` 之间是一对多关系：一个菜品可以被多个订单所包含。

## 4. 物理设计

在具体的物理设计中，考虑到了数据库的索引优化和表之间关系的完整性。

* **数据库管理系统**：SQL Server
* **主键和外键**：各表设置了主键，并在适当字段上建立了外键关系。
* **索引设计**：为提高查询效率，在 `user_id`、`dish_id` 等字段上添加索引。
* **存储策略**：
  - 所有的价格字段使用 `DECIMAL` 类型，以确保存储货币的精度。
  - 日期字段均使用 `DATETIME` 类型，记录精确的创建时间。

## 5. 数据表的数据字典

### 5.1 用户表数据字典
| 字段名称    | 数据类型       | 是否为空 | 默认值       | 说明               |
|-------------|----------------|----------|--------------|--------------------|
| user_id     | INT            | 否       | 自增         | 用户唯一标识       |
| username    | NVARCHAR(50)   | 否       | 无           | 用户名，唯一       |
| password    | NVARCHAR(255)  | 否       | 无           | 用户密码（加密存储）|
| user_type   | NVARCHAR(20)   | 否       | 顾客         | 用户类型，顾客或管理员|
| created_at  | DATETIME       | 否       | GETDATE()    | 用户注册时间       |

### 5.2 菜品表数据字典
| 字段名称    | 数据类型       | 是否为空 | 默认值       | 说明               |
|-------------|----------------|----------|--------------|--------------------|
| dish_id     | INT            | 否       | 自增         | 菜品唯一标识       |
| dish_name   | NVARCHAR(100)  | 否       | 无           | 菜品名称           |
| price       | DECIMAL(10,2)  | 否       | 无           | 菜品价格           |
| stock       | INT            | 否       | 无           | 菜品库存           |
| created_at  | DATETIME       | 否       | GETDATE()    | 菜品创建时间       |

### 5.3 订单表数据字典
| 字段名称    | 数据类型       | 是否为空 | 默认值       | 说明               |
|-------------|----------------|----------|--------------|--------------------|
| order_id    | INT            | 否       | 自增         | 订单唯一标识       |
| user_id     | INT            | 否       | 无           | 下单用户 ID，外键  |
| total_amount| DECIMAL(10,2)  | 否       | 无           | 订单总金额         |
| created_at  | DATETIME       | 否       | GETDATE()    | 订单创建时间       |

### 5.4 订单详情表数据字典
| 字段名称    | 数据类型       | 是否为空 | 默认值       | 说明               |
|-------------|----------------|----------|--------------|--------------------|
| detail_id   | INT            | 否       | 自增         | 订单详情唯一标识   |
| order_id    | INT            | 否       | 无           | 所属订单 ID，外键  |
| dish_id     | INT            | 否       | 无           | 所属菜品 ID，外键  |
| quantity    | INT            | 否       | 无           | 菜品数量           |

## 6.使用说明：
#### 环境需求：node 18 + react + express
### 1.首先需要配置一下本地数据库，在数据库里面输入本项目database文件夹的`order.sql`文件，来创建相对应的数据库。除此之外数据库的sa密码要正确填入backend的`.env`文件。

### 2.然后打开电脑上的sql server配置管理器，在里面启动TCP/IP协议，默认端口1433，在本地防火墙也要添加允许这个端口通过（如果需要的话）。
<img src="frontend/order-management-frontend/public/image.png" alt="配置管理器" style="width:300px; height:auto;">

```js
ps:此步不能改数据库的1433端口，否则会报错。
```
### 3.下面配置后端的`.env`文件。
具体内容应该如下：
```bash
DB_USER=
DB_PASSWORD=
DB_SERVER=
DB_NAME=
JWT_SECRET=
PORT=
```
1.DB_USER为了图方便我直接sa，生产环境如何不得知。</br>
2.DB_PASSWORD填你的密码，我这里就是sa的密码。</br>
3.DB_SERVER本地就是localhost，云端填你云端数据库的远程服务器的 IP 地址或者域名。</br>
4.DB_NAME我这里就是OrderManagement，你可以改成你起的数据库名，但一定要对应上。</br>
5.JWT_SECRET是中间件的验证密钥，你可以自己想一个复杂的或者用工具生成。</br>
6.PORT由于我是本地我就填了5000,如果是远程服务器就填远程服务器端口，例如8080.</br>

### 4.此时应该就可以运行后端服务器了，具体步骤如下：
1.切换到`/backend`文件夹下面：</br>
```bash
cd backend
```
2.运行后端服务器：
```bash
node server.js
```
3.检验：</br>

此时打开端口应当看到正常启动服务器，如若没有请根据报错信息排查。

### 5.前端配置：
1.前端的`.env`文件配置：
```s
# 服务器的 API 基础 URL
REACT_APP_API_URL=

# 应用模式（例如开发模式）
REACT_APP_MODE=
```
URL填写你服务器端口的url，例如本地就是http://localhost:5000

mode可以不管他，是为了区分处于哪一种环境下的。

2.下载模块：</br>
(1).需要下载react的`react-router-dom`路由库来实现页面的跳转导航
```bash
cd frontend/order-management-frontend
npm install react-router-dom
```
或者
```bash
yarn add react-router-dom
```
(2).安装`axios` HTTP 客户端库:</br>
```bash
npm install axios
```
或者
```bash
yarn add axios
```
(3).安装`react-icons`图标集合库:</br>
```bash
npm install react-icons
```
或者
```bash
yarn add react-icons
```
3.启动前端服务：
```bash
cd frontend/order-management-frontend
npm start
```
4.此时前端应该能正常运行，可以在浏览器端口中查看并且与后端和数据库进行交互了。