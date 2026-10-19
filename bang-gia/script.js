jQuery(async function ($) {
  const urlParams = new URLSearchParams(window.location.search);


  const ip = "";
  const ua = "";
  const username = "";
  const password = "";
  const date = "19102026";
  const key = urlParams.get('key');

  let sheetDataJson = [];

  try {
    const resp = await fetch(`https://script.google.com/macros/s/AKfycbzffnvjPF1WW5mEe-_k7NMAkCxYLq5jjvcBf4iJs5GbgkqLlbMO3QkPjCCg50T3ntoj/exec?id=ab&json=1&key=${key}`, {
      method: 'get',
      redirect: "follow", // Bắt buộc phải có để xử lý mã 302
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
    });

    if (!resp.ok) throw new Error('500');

    sheetDataJson = await resp.json().catch(() => []);

    if ((sheetDataJson?.length ?? 0) <= 0) throw new Error('404');


    const allModel = [...new Set(sheetDataJson.map(line => line.name).filter(Boolean))];

    const middleIndex = Math.ceil(allModel.length / 2);

    // Chia làm 2 phần
    const part1 = allModel.slice(0, middleIndex);
    const part2 = allModel.slice(middleIndex);

    $([part1, part2]).each((idx_0, models) => {
      const tableElm = $(`#col_${idx_0} table tbody`);
      $(models).each((idx_1, model) => {
        const rowsModel = sheetDataJson.filter(i => i.name === model);

        const allMem = [...new Set(rowsModel.map(l => l.mem).filter(Boolean))];
        const allColor = [...new Set(rowsModel.map(l => l.color).filter(Boolean))]

        const colorGroupLength = Math.ceil(allColor.length / 3);

        const modelCell = $(`<td class="model">`)
          .html(`<span>${model}</span>`)
          .attr({
            "rowspan": (colorGroupLength * allMem.length),
            "title": model
          });

        $(allMem).each((idx_2, mem) => {

          const memOdClass = (idx_2 % 2) ? "mem-odd" : "mem-even"

          const memCell = $(`<td class="mem ${memOdClass}">`)
            .html(`<span>${mem}</span>`)
            .attr({ "rowspan": colorGroupLength });

          for (let i = 0; i < allColor.length; i += 3) {
            // Cắt mảng thành một nhóm gồm tối đa 3 phần tử
            const group = allColor.slice(i, i + 3);

            const tr = $('<tr>');

            if (idx_2 === 0 && i === 0) {
              tr.append(modelCell);
            }

            if (i === 0) {
              tr.append(memCell);
            }

            $(Array.from({ length: 3 })).each(idx_3 => {
              const color = group[idx_3];
              const price = rowsModel.find(i => (i.mem === mem && i.color === color))?.price;
              const priceFormated = price ? Number(price).toLocaleString() : "";

              const colorCell = $(`<td class="color ${memOdClass} ${price ? "has-price" : "no-price"}">`)
                .html(`<span>${color ?? ""}</span>`);
              const priceCell = $(`<td class="price ${memOdClass}">`)
                .html(`<span>${priceFormated}</span>`);

              price && priceCell.attr({ "title": `${model} - ${mem} - ${color}` })

              priceCell.on('hover', () => {

              })

              tr.append(colorCell, priceCell);
            })

            tableElm.append(tr);

            if (idx_2 + 1 === allMem.length && i + 3 >= allColor.length) {
              tableElm.append($('<tr class="space"><td colspan="8">&nbsp;</td></tr>'));
            }
          }

          // tableElm.append($('<tr><td class="space" colspan="8">&nbsp;</td></tr>'));
        })
      })
    })

  } catch (e) {
    alert(e instanceof Error ? e.message : "Lỗi không xác định");
    return;
  } finally {

    $('.loader-wrapper').hide()
  }

});

