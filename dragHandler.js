// Manejo de arrastre horizontal en contenedores
export function handleDrag(container) {
    let isDragging = false;
    let startX;
    let scrollLeft;

    container.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const x = e.pageX - container.offsetLeft;
      const step = (x - startX) * 0.6;
      container.scrollLeft = scrollLeft - step;
    });

    container.addEventListener("mouseup", () => {
      isDragging = false;
    });

    container.addEventListener("mouseleave", () => {
      isDragging = false;
    });
  }