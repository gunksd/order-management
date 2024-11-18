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

// 查询用户的订单
const getOrdersByUserId = `
    SELECT * FROM [order] WHERE user_id = @user_id;
`;

module.exports = {
    getUserByUsername,
    getAllDishes,
    insertDish,
    insertOrder,
    insertOrderDetails,
    getOrdersByUserId
};
