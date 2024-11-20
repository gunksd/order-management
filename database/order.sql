-- 创建数据库
CREATE DATABASE OrderManagement;
GO

-- 切换到数据库
USE OrderManagement;
GO

-- 创建用户表
CREATE TABLE [user] (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    user_type NVARCHAR(20) DEFAULT '顾客',
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 创建菜品表
CREATE TABLE dish (
    dish_id INT PRIMARY KEY IDENTITY(1,1),
    dish_name NVARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 创建订单表
CREATE TABLE [order] (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [user](user_id)
);
GO

-- 创建订单详情表
CREATE TABLE order_details (
    detail_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES [order](order_id),
    FOREIGN KEY (dish_id) REFERENCES dish(dish_id)
);
GO
INSERT INTO [user] (username, password, user_type)
VALUES 
('admin', 'admin123', '管理员'),
('customer1', 'password123', '顾客'),
('customer2', 'password456', '顾客');
GO

INSERT INTO dish (dish_name, price, stock)
VALUES 
('Kung Pao Chicken', 12.99, 50),
('Sweet and Sour Pork', 10.99, 30),
('Fried Rice', 8.50, 100);
GO
