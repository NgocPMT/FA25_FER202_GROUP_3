// câu 1.
function chaoMung(ten, tuoi) {
  return `Xin chào, tôi tên là ${ten}, năm nay ${tuoi} tuổi.`;
}

console.log(chaoMung("Lợi", 20));

// câu 2.
function thongTinSanPham(tenSanPham, gia) {
  return `Sản phẩm: ${tenSanPham}\nGiá: ${gia.toLocaleString()} VNĐ`;
}

console.log(thongTinSanPham("Laptop", 15000000));

// câu 3.
const tho = `
Trời xanh mây trắng nắng vàng,
Con chim ca hát rộn ràng mùa xuân.
Hoa tươi khoe sắc trong ngần,
Niềm vui lan tỏa khắp trần gian tươi.
`;

console.log(tho);
