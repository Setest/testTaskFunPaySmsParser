<?php

/**
 * Parse message and return transaction data
 *
 * @param string $msg message
 * @return array transaction data ['code', 'amount', 'currency', 'walletId']
 */
function yandexSmsParser(string $msg = ''): array
{
    $result = [
        'code'     => '',
        'amount'   => '',
        'currency' => '',
        'walletId' => ''
    ];

    $msg = str_replace('<br />', '', nl2br($msg));
    $msg = preg_replace('/\s+/', ' ', preg_replace("@[\t|\\n|\n]@i", " ", $msg));

    if ($msg) {
        if (preg_match('/(?<walletId>4100\d{6,})/', $msg, $matches)) {
            if (isset($matches['walletId']) && $matches['walletId']) {
                $result['walletId'] = $matches['walletId'];
                $msg = str_replace($matches['walletId'], '', $msg);
            }
        }

        if (preg_match('/(?<amount>\d+,\d{2,})\s*(?<currency>[^0-9\.\s]+)?/', $msg, $matches)) {
            if (isset($matches['amount']) && $matches['amount']) {
                $result['amount'] = $matches['amount'];
                $msg = str_replace($matches['amount'], '', $msg);
            }

            if (isset($matches['currency']) && $matches['currency']) {
                $result['currency'] = $matches['currency'];
            }
        }

        if (preg_match('/(?<code>\d{4,})/', $msg, $matches)) {
            if (isset($matches['code']) && $matches['code']) {
                $result['code'] = $matches['code'];
            }
        }
    }
    return $result;
}

$msg = <<<EOT
Пароль: 7706<br />

Перевод на счет
41001852948060

Спишется

390,96    руб  .<br />

EOT;
var_export(yandexSmsParser($msg));
