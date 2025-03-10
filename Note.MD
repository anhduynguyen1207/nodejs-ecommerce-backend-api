### morgan
Chạy in ra các log mà khi người dùng request tới sever có 5 loại

### helmet 
Bảo vệ API ngăn chặn bên thứ 3 truy cập vào. Ví dụ khi biết ta sử dụng Express làm server nó sẽ khai thác vào đó như lên xem Express có những lỗ hổng nào trong năm qua và khai thác lổ hổng đó qua API của ta.

### compression
giảm băng thông khi send payload để tiết kiệm 


### Design Patter Singleton cho file kết nối db mongo
Sẽ tạo file Singleton cho kết nối 1 lần không tạo kết nối mới khi đã có kết nối.
