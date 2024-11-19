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
    SELECT * FROM [order] WHERE user_id = @user_id;
`;

// 查询特定订单详细信息
const getOrderById = `
    SELECT * FROM [order] 
    WHERE order_id = @order_id;
`;

// 删除订单
const deleteOrderById = `
    DELETE FROM [order]
    WHERE order_id = @order_id;
`;

module.exports = {
    getUserByUsername,
    getAllDishes,
    insertDish,
    deleteDishQuery, // 新增删除菜品的 SQL 语句
    updateDishQuery, // 包括更新菜品的 SQL 语句
    insertOrder,
    insertOrderDetails,
    getOrdersByUserId,
    getOrderById,
    deleteOrderById
};
