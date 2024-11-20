// 查询用户信息
const getUserByUsername = `
    SELECT * FROM [user] WHERE username = @username;
`;

// 查询所有菜品
const getAllDishes = `
    SELECT * FROM dish;
`;

// 插入新菜品
const insertDish = `
    INSERT INTO dish (dish_name, price, stock) 
    VALUES (@dish_name, @price, @stock);
`;

// 删除菜品
const deleteDishQuery = `
    DELETE FROM dish 
    WHERE dish_id = @dish_id;
`;

// 更新菜品
const updateDishQuery = `
    UPDATE dish 
    SET dish_name = @dish_name, price = @price, stock = @stock 
    WHERE dish_id = @dish_id;
`;

// 插入订单
const insertOrder = `
    INSERT INTO [order] (user_id, total_amount, created_at)
    OUTPUT INSERTED.order_id
    VALUES (@user_id, @total_amount, GETDATE());
`;

// 插入订单详情
const insertOrderDetails = `
    INSERT INTO order_details (order_id, dish_id, quantity)
    VALUES (@order_id, @dish_id, @quantity);
`;

// 查询用户的所有订单
const getOrdersByUserId = `
    SELECT order_id, user_id, total_amount, created_at, status 
    FROM [order] 
    WHERE user_id = @user_id;
`;

// 查询特定订单详细信息
const getOrderById = `
    SELECT * FROM [order] 
    WHERE order_id = @order_id;
`;

// 删除订单
const deleteOrderQuery = `
    DELETE FROM [order] 
    WHERE order_id = @order_id;
`;

// 删除订单详情（以确保正确删除订单的详细信息）
const deleteOrderDetailsQuery = `
    DELETE FROM order_details 
    WHERE order_id = @order_id;
`;

const insertUser = `
    INSERT INTO [user] (username, password, user_type)
    VALUES (@username, @password, '顾客')
`;

// 更新订单支付状态
const updateOrderStatus = `
    UPDATE [order]
    SET status = @status, paid_at = @paid_at
    WHERE order_id = @order_id;
`;

module.exports = {
    getUserByUsername,
    insertUser,
    getAllDishes,
    insertDish,
    deleteDishQuery,
    updateDishQuery,
    insertOrder,
    insertOrderDetails,
    getOrdersByUserId,
    getOrderById,
    deleteOrderQuery,
    deleteOrderDetailsQuery,
    updateOrderStatus
};