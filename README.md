# Link
目前可以实现：
相同颜色连接成一条线（横线、竖线、斜线45°），会消除在线上的同色方块，如果方块上有污染物，污染物也会消除。
污染物固定不动，方块消除后，上方会补充。

未实现：
污染物生成时不会相会堆叠，只会相会覆盖（相互覆盖后需要消除两次还是消除一次？）
若多个污染物位于同一消除路径上，按“油污 > 渔网 > 塑料瓶”优先级依次判定，被高优先级污染物遮挡的低优先级污染物不会被消除。
消除方块后会获得氧气值，氧气值的数值由连线上的方块数量决定，基础消除后为10氧气，多一个+5

